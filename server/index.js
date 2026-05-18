require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const OpenAI = require('openai');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Prometheus = require('prom-client');

// Import local modules
const { config, validateConfig } = require('./config');
const logger = require('./utils/logger');
const { AppError, errorHandler, asyncHandler } = require('./middleware/errorHandler');
const { 
  validateChatRequestRules, 
  validateChatRequest, 
  createRateLimiter 
} = require('./middleware/validator');

// Validate configuration on startup
try {
  validateConfig();
  logger.info('Configuration validated successfully');
} catch (error) {
  logger.error('Configuration validation failed', { error: error.message });
  console.error('❌ Configuration Error:', error.message);
  process.exit(1);
}

const app = express();
const PORT = config.port;

// ============================================
// PROMETHEUS METRICS SETUP
// ============================================
const register = new Prometheus.Registry();
Prometheus.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new Prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestTotal = new Prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const chatRequestsTotal = new Prometheus.Counter({
  name: 'chat_requests_total',
  help: 'Total number of chat requests',
  labelNames: ['is_lead']
});

const activeConnections = new Prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(chatRequestsTotal);
register.registerMetric(activeConnections);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://api.telegram.org"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Rate limiting
app.use(createRateLimiter(config.rateLimit.maxRequests, config.rateLimit.windowMs));

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders,
  credentials: config.cors.origin !== '*'
}));

// ============================================
// REQUEST PARSING & LOGGING
// ============================================

// Body parser with size limit
app.use(express.json({ 
  limit: '1mb',
  strict: true
}));

// URL-encoded parser
app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb' 
}));

// Static files with caching
app.use(express.static('public', {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  cacheControl: true
}));

// Request ID middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  res.setHeader('X-Powered-By', 'Neuro Sales Widget');
  next();
});

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );
    
    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode
    });
  });
  
  next();
});

// Logging middleware
app.use(logger.requestLogger);

// Connection tracking
app.use((req, res, next) => {
  activeConnections.inc();
  res.on('finish', () => activeConnections.dec());
  next();
});

// OpenAI Configuration with retry logic
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 30000,
});

// Системный промпт для нейропродавца
const SALES_SYSTEM_PROMPT = `Ты - нейропродавец компании ${process.env.COMPANY_NAME || 'lidorubov.net'}, использующий передовые технологии GPT-5. Твоя задача - выявить потребности клиента и продать услугу по передаче голосом подтвержденных клиентов. Ты должен строго следовать скрипту продаж, который включает:

1. ПРИВЕТСТВИЕ: Представься и кратко опиши суть услуги
   "Вас приветствует нейропродавец компании lidorubov.net. Мы передаем вам только тех клиентов, которые голосом подтвердили, что хотят у вас купить. Это не реклама, а готовые продажи. У вас есть 2 минуты?"

2. АВТОРИТЕТ: Расскажи про успешные кейсы
   "Мы работаем с крупными компаниями: Открытие Банк, BMW, Skillbox, Сбербанк и другими. Более 7 лет в нише, с кейсами роста продаж на 30-50% за 2-3 месяца."

3. ДИАГНОСТИКА: Задай 5 ключевых вопросов для выявления потребностей:
   - "Какой у вас текущий средний чек?"
   - "Каким образом вы привлекаете клиентов? (реклама, рекомендации, холдколы и т.д.)"
   - "У вас есть сайт? Если да, поделитесь URL."
   - "Вы используете Яндекс Директ или другие рекламные каналы?"
   - "У вас есть отдел продаж? Если да, занимаются ли они холодными звонками?"

4. ПРЕЗЕНТАЦИЯ: Объясни преимущества нашей услуги
   "Наши алгоритмы находят людей, которые прямо сейчас ищут ваши услуги, фильтруем их по критериям, подтверждают интерес голосом, и передаём вам уже готовых к покупке клиентов."

5. ZOOM/КОНТАКТ: Предложи встречу или попроси контакт
   "Предлагаю за 20 минут в Zoom показать конкретные цифры и кейсы по вашей нише. Когда вам удобнее — завтра в 10:00 или в 14:00? Или оставьте телефон, и мы с вами свяжемся."

6. ВОЗРАЖЕНИЯ: Если отказ - настойчиво предложи Zoom или возьми телефон
   "Понимаю, что вы сначала хотите всё обдумать. Но решение здесь простое: либо вы видите, как это работает в вашей нише, либо нет. 20 минут в Zoom — и вы сами решите. Когда ставим встречу?"

Особенности поведения:
- Будь настойчивым, но вежливым
- Используй полученную информацию для персонализации ответов
- Запоминай ответы клиента и используй их в дальнейшем разговоре
- Если клиент дал ключевую информацию (телефон, email, согласие на встречу) - сразу переадресуй к следующему этапу
- Говори коротко и по делу
- Используй данные из разговора для усиления убедительности

Не отклоняйся от скрипта. Переходи к следующему этапу только после получения ответа пользователя на текущий вопрос, если это уместно.`;

// Хранилище диалогов (в реальном проекте использовать БД)
const conversations = new Map();

// Определение этапа лида
function detectLeadStage(userMessage, conversationHistory) {
  const message = userMessage.toLowerCase();
  
  const triggers = {
    'zoom': 'Согласие на встречу',
    'встреча': 'Согласие на встречу',
    'телефон': 'Оставил контакты',
    'позвоните': 'Запрос звонка',
    'звоните': 'Запрос звонка',
    'email': 'Оставил контакты',
    'почта': 'Оставил контакты',
    'подумать': 'Возражение - подумать',
    'нет времени': 'Возражение - нет времени',
    'не интересует': 'Возражение - не интересует',
    'не нужно': 'Возражение - не интересует',
    'уже есть': 'Возражение - уже есть решение',
    'интересует': 'Проявил интерес',
    'готов обсудить': 'Проявил интерес',
    'да': conversationHistory.length > 2 ? 'Положительный ответ' : null,
    'ок': conversationHistory.length > 2 ? 'Положительный ответ' : null,
    'ладно': conversationHistory.length > 2 ? 'Положительный ответ' : null,
    'согласен': 'Согласие на встречу',
    'давайте': 'Согласие на встречу',
    'запишите': 'Согласие на встречу',
    'мне подходит': 'Согласие на встречу',
    'средний чек': 'Диагностика - средний чек упомянут',
    'реклама': 'Диагностика - канал привлечения',
    'сайт': 'Диагностика - упоминание сайта',
    'директ': 'Диагностика - упоминание рекламы',
    'отдел продаж': 'Диагностика - упоминание отдела продаж',
    'холодные звонки': 'Диагностика - упоминание холодных звонков',
  };
  
  for (const [keyword, stage] of Object.entries(triggers)) {
    if (message.includes(keyword) && stage) {
      return stage;
    }
  }
  
  return null;
}

// Извлечение контактов из сообщения
function extractContacts(message) {
  const phoneRegex = /\+?[0-9]{1,4}?[-.\s]?\(?[0-9]{1,4}?\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
  
  const phones = message.match(phoneRegex) || [];
  const emails = message.match(emailRegex) || [];
  const urls = message.match(urlRegex) || [];
  
  return {
    phones,
    emails,
    urls,
    hasContacts: phones.length > 0 || emails.length > 0 || urls.length > 0
  };
}

// Отправка уведомления в Telegram
async function sendTelegramNotification(leadData) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    console.log('Telegram не настроен. Лид:', leadData);
    return;
  }
  
  // Поддержка нескольких chat_id через запятую
  const chatIds = process.env.TELEGRAM_CHAT_ID.split(',').map(id => id.trim()).filter(id => id);
  
  const { stage, contacts, userMessage, conversationHistory } = leadData;
  
  const lastMessages = conversationHistory
    .slice(-5) // Увеличим до 5 последних сообщений для лучшего контекста
    .map(msg => `${msg.role === 'user' ? '👤 Клиент' : '🤖 Нейропродавец'}: ${msg.content}`)
    .join('\n');
  
  let contactsInfo = 'Контакты не указаны';
  if (contacts.hasContacts) {
    if (contacts.phones.length > 0) contactsInfo = `📞 Телефон: ${contacts.phones.join(', ')}\n`;
    if (contacts.emails.length > 0) contactsInfo += `📧 Email: ${contacts.emails.join(', ')}\n`;
    if (contacts.urls.length > 0) contactsInfo += `🌐 Сайт: ${contacts.urls.join(', ')}\n`;
    contactsInfo = contactsInfo.trim();
  }
  
  // Анализируем разговор, чтобы извлечь информацию о потребностях клиента
  const conversationText = conversationHistory.map(msg => msg.content).join(' ');
  const needsInfo = analyzeClientNeeds(conversationText);
  
  let needsInfoText = '';
  if (needsInfo.length > 0) {
    needsInfoText = `\n📋 Выявленные потребности:\n${needsInfo.map(need => `• ${need}`).join('\n')}\n`;
  }
  
  const message = `🎯 НОВЫЙ ЛИД | ${process.env.COMPANY_NAME || 'lidorubov.net'}
──────────────
⏰ Время: ${new Date().toLocaleString('ru-RU')}
📊 Этап: ${stage}
${contactsInfo}
${needsInfoText}
💬 Последнее сообщение: "${userMessage}"
📜 История разговора (последние 5 сообщений):
${lastMessages}`;
  
  // Отправка уведомления всем администраторам
  const sendPromises = chatIds.map(chatId => 
    axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      }
    ).catch(error => {
      console.error(`❌ Ошибка отправки в Telegram (chat_id: ${chatId}):`, error.message);
      return null;
    })
  );
  
  try {
    const results = await Promise.allSettled(sendPromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
    console.log(`✅ Уведомление отправлено ${successCount} из ${chatIds.length} администраторам`);
  } catch (error) {
    console.error('❌ Критическая ошибка отправки в Telegram:', error.message);
  }
}

// Функция для анализа потребностей клиента по истории разговора
function analyzeClientNeeds(conversationText) {
  const lowerText = conversationText.toLowerCase();
  const needs = [];
  
  // Проверяем наличие информации о среднем чеке
  const avgCheckMatch = lowerText.match(/средний чек[:\s]*([0-9\s.,]+)/i);
  if (avgCheckMatch) {
    needs.push(`Средний чек: ${avgCheckMatch[1].trim()}`);
  }
  
  // Проверяем каналы привлечения клиентов
  if (lowerText.includes('реклама') || lowerText.includes('рекламу')) {
    needs.push('Привлекает клиентов через рекламу');
  }
  if (lowerText.includes('рекомендации') || lowerText.includes('по рекомендациям')) {
    needs.push('Привлекает клиентов по рекомендациям');
  }
  if (lowerText.includes('холодные') && lowerText.includes('звонк')) {
    needs.push('Использует холодные звонки');
  }
  
  // Проверяем наличие сайта
  if (lowerText.includes('сайт') && !lowerText.includes('нет сайта') && !lowerText.includes('сайта нет')) {
    needs.push('Есть сайт');
  } else if (lowerText.includes('нет сайта') || lowerText.includes('сайта нет')) {
    needs.push('Нет сайта');
  }
  
  // Проверяем использование рекламных каналов
  if (lowerText.includes('яндекс') && lowerText.includes('директ')) {
    needs.push('Использует Яндекс Директ');
  }
  if (lowerText.includes('google') && (lowerText.includes('ads') || lowerText.includes('adwords'))) {
    needs.push('Использует Google Ads');
  }
  
  // Проверяем наличие отдела продаж
  if (lowerText.includes('отдел продаж') || lowerText.includes('есть отдел')) {
    needs.push('Есть отдел продаж');
  }
  
  // Если не нашли конкретной информации, указываем общие признаки
  if (needs.length === 0) {
    if (lowerText.includes('средний') && lowerText.includes('чек')) needs.push('Упоминал средний чек');
    if (lowerText.includes('клиент') && (lowerText.includes('привлека') || lowerText.includes('нахожу'))) needs.push('Обсуждал привлечение клиентов');
    if (lowerText.includes('сайт')) needs.push('Обсуждал наличие сайта');
    if (lowerText.includes('реклам')) needs.push('Обсуждал рекламные каналы');
    if (lowerText.includes('директ')) needs.push('Упоминал Яндекс Директ');
    if (lowerText.includes('отдел') && lowerText.includes('продаж')) needs.push('Обсуждал отдел продаж');
  }
  
  return needs;
}

// API Endpoint для чата с валидацией и обработкой ошибок
app.post('/api/chat', 
  asyncHandler(async (req, res) => {
    // Validate request
    validateChatRequest(req, res, () => {});
    
    const { message, sessionId } = req.body;
    
    logger.info('Chat request received', { sessionId, messageLength: message.length });
    
    // Получаем или создаем историю диалога
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, [
        { role: 'system', content: SALES_SYSTEM_PROMPT }
      ]);
    }
    
    const conversationHistory = conversations.get(sessionId);
    
    // Limit conversation history to prevent memory issues
    if (conversationHistory.length > 20) {
      // Keep system prompt and last 19 messages
      const systemPrompt = conversationHistory[0];
      const recentMessages = conversationHistory.slice(-19);
      conversationHistory.splice(0, conversationHistory.length, systemPrompt, ...recentMessages);
    }
    
    conversationHistory.push({ role: 'user', content: message });
    
    // Вызов OpenAI API с retry logic
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: conversationHistory,
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.3,
        max_tokens: 800,
      });
    } catch (openaiError) {
      logger.error('OpenAI API error', { error: openaiError.message });
      throw new AppError('Failed to get AI response', 503, 'OPENAI_ERROR');
    }
    
    const aiResponse = completion.choices[0].message.content;
    conversationHistory.push({ role: 'assistant', content: aiResponse });
    
    // Определяем, является ли это лидом
    const leadStage = detectLeadStage(message, conversationHistory);
    const contacts = extractContacts(message);
    
    if (leadStage || contacts.hasContacts) {
      // Отправляем уведомление в Telegram (не блокируем ответ)
      sendTelegramNotification({
        stage: leadStage || 'Оставил контакты',
        contacts,
        userMessage: message,
        conversationHistory: conversationHistory.filter(msg => msg.role !== 'system')
      }).catch(err => {
        logger.error('Telegram notification failed', { error: err.message });
      });
    }
    
    logger.info('Chat response sent', { sessionId, isLead: !!leadStage || contacts.hasContacts });
    
    res.json({
      success: true,
      response: aiResponse,
      isLead: !!leadStage || contacts.hasContacts,
      leadStage,
      requestId: req.id
    });
  })
);

// Healthcheck endpoint with detailed status
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'ok',
    version: process.env.SALES_SCRIPT_VERSION || '1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
const server = app.listen(PORT, () => {
  logger.info('Server started', { 
    port: PORT, 
    environment: process.env.NODE_ENV || 'development',
    version: process.env.SALES_SCRIPT_VERSION || '1.0'
  });
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📊 Версия скрипта: ${process.env.SALES_SCRIPT_VERSION || '1.0'}`);
  console.log(`🤖 Модель OpenAI: ${process.env.OPENAI_MODEL || 'gpt-4o'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason: reason?.message || reason });
  process.exit(1);
});
