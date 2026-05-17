/**
 * Logger Utility
 * Structured logging for production environments
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL || 'INFO'] || LOG_LEVELS.INFO;

const formatLog = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };
  
  return JSON.stringify(logEntry);
};

const logger = {
  error: (message, meta = {}) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.ERROR) {
      console.error(formatLog('ERROR', message, meta));
    }
  },
  
  warn: (message, meta = {}) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.WARN) {
      console.warn(formatLog('WARN', message, meta));
    }
  },
  
  info: (message, meta = {}) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.INFO) {
      console.info(formatLog('INFO', message, meta));
    }
  },
  
  debug: (message, meta = {}) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.DEBUG) {
      console.debug(formatLog('DEBUG', message, meta));
    }
  },
  
  // Request logging middleware
  requestLogger: (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        durationMs: duration,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent')
      });
    });
    
    next();
  }
};

module.exports = logger;
