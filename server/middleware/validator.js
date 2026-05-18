/**
 * Request Validation Middleware
 * Validates incoming request data with express-validator
 */

const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { AppError } = require('./errorHandler');

// Validation rules for chat request
const validateChatRequestRules = [
  body('message')
    .exists({ checkFalsy: true }).withMessage('Message is required')
    .isString().withMessage('Message must be a string')
    .trim()
    .isLength({ max: 2000 }).withMessage('Message too long (max 2000 characters)'),
  
  body('sessionId')
    .exists({ checkFalsy: true }).withMessage('Session ID is required')
    .isString().withMessage('Session ID must be a string')
    .trim()
];

// Middleware to handle validation results
const validateChatRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    throw new AppError(errorMessages.join(', '), 400, 'VALIDATION_ERROR');
  }
  
  next();
};

// Rate limiter configuration
const createRateLimiter = (maxRequests = 100, windowMs = 60000) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.'
      }
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress || 'unknown';
    },
    handler: (req, res, next, options) => {
      res.status(429).json(options.message);
    }
  });
};

// Store for conversation sessions with cleanup
const conversationStore = new Map();

// Cleanup old conversations periodically
setInterval(() => {
  const now = Date.now();
  const sessionTimeout = parseInt(process.env.SESSION_TIMEOUT_MS, 10) || 3600000; // 1 hour default
  
  for (const [sessionId, data] of conversationStore.entries()) {
    if (data.lastAccessed && (now - data.lastAccessed > sessionTimeout)) {
      conversationStore.delete(sessionId);
    }
  }
}, 60000); // Run every minute

module.exports = {
  validateChatRequestRules,
  validateChatRequest,
  createRateLimiter,
  conversationStore
};
