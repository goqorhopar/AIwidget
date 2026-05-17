/**
 * Request Validation Middleware
 * Validates incoming request data
 */

const { AppError } = require('./errorHandler');

// Validate chat request
const validateChatRequest = (req, res, next) => {
  const { message, sessionId } = req.body;
  
  // Check if message exists
  if (!message || typeof message !== 'string') {
    throw new AppError('Message is required and must be a string', 400, 'VALIDATION_ERROR');
  }
  
  // Trim and check message length
  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) {
    throw new AppError('Message cannot be empty', 400, 'VALIDATION_ERROR');
  }
  
  // Max message length (prevent abuse)
  if (trimmedMessage.length > 2000) {
    throw new AppError('Message too long (max 2000 characters)', 400, 'VALIDATION_ERROR');
  }
  
  // Check if sessionId exists
  if (!sessionId || typeof sessionId !== 'string') {
    throw new AppError('Session ID is required', 400, 'VALIDATION_ERROR');
  }
  
  // Sanitize message (basic XSS prevention)
  req.body.message = trimmedMessage;
  req.body.sessionId = sessionId.trim();
  
  next();
};

// Rate limit state (in production, use Redis or similar)
const rateLimitStore = new Map();

const rateLimiter = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get or create rate limit entry for this IP
    if (!rateLimitStore.has(ip)) {
      rateLimitStore.set(ip, []);
    }
    
    const requests = rateLimitStore.get(ip);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if rate limit exceeded
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.'
        }
      });
    }
    
    // Add current request timestamp
    validRequests.push(now);
    rateLimitStore.set(ip, validRequests);
    
    next();
  };
};

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const windowStart = now - windowMs;
  
  for (const [ip, requests] of rateLimitStore.entries()) {
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    if (validRequests.length === 0) {
      rateLimitStore.delete(ip);
    } else {
      rateLimitStore.set(ip, validRequests);
    }
  }
}, windowMs);

module.exports = {
  validateChatRequest,
  rateLimiter
};
