/**
 * Logger Utility
 * Structured logging for production environments using Winston
 */

const winston = require('winston');
const path = require('path');

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LEVEL = process.env.LOG_LEVEL || 'INFO';

// Custom format for JSON logging
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'ISO8601' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Custom format for development (colored console)
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: CURRENT_LEVEL,
  levels: LOG_LEVELS,
  defaultMeta: { service: 'neuro-sales-widget' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? jsonFormat : devFormat
    }),
    
    // File transport for errors (production only)
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({
        filename: path.join('/var/log', 'error.log'),
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 5
      }),
      new winston.transports.File({
        filename: path.join('/var/log', 'combined.log'),
        maxsize: 10485760, // 10MB
        maxFiles: 5
      })
    ] : [])
  ],
  
  // Exit on error (optional, can be disabled)
  exitOnError: false
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      requestId: req.id
    });
  });
  
  next();
};

module.exports = logger;
module.exports.requestLogger = requestLogger;
