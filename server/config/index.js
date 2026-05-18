/**
 * Application Configuration
 * Centralized configuration management with validation
 */

const config = {
  // Server Configuration
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.3,
    maxRetries: 3,
    timeout: 30000,
    maxTokens: 800
  },

  // Telegram Configuration
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatIds: process.env.TELEGRAM_CHAT_ID
      ? process.env.TELEGRAM_CHAT_ID.split(',').map(id => id.trim()).filter(id => id)
      : []
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
  },

  // Rate Limiting Configuration
  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'INFO',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'combined'
  },

  // Company Configuration
  company: {
    name: process.env.COMPANY_NAME || 'lidorubov.net',
    salesScriptVersion: process.env.SALES_SCRIPT_VERSION || '2.0'
  },

  // Security Configuration
  security: {
    maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH, 10) || 2000,
    maxConversationHistory: parseInt(process.env.MAX_CONVERSATION_HISTORY, 10) || 20,
    sessionTimeoutMs: parseInt(process.env.SESSION_TIMEOUT_MS, 10) || 3600000 // 1 hour
  }
};

// Validation function
function validateConfig() {
  const errors = [];

  if (!config.openai.apiKey) {
    errors.push('OPENAI_API_KEY is required');
  }

  if (config.openai.temperature < 0 || config.openai.temperature > 1) {
    errors.push('OPENAI_TEMPERATURE must be between 0 and 1');
  }

  if (config.port < 1 || config.port > 65535) {
    errors.push('PORT must be a valid port number (1-65535)');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }

  return true;
}

module.exports = {
  config,
  validateConfig
};
