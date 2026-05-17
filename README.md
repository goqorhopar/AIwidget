# 🎯 Neuro Sales Widget

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991.svg)](https://openai.com)
[![Telegram](https://img.shields.io/badge/Telegram-Notifications-blue.svg)](https://core.telegram.org/bots)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Интерактивный AI-чат для вашего сайта с интеграцией GPT-4o, голосовым взаимодействием и Telegram-уведомлениями о лидах.

> **Production-ready** решение для автоматизации продаж и генерации лидов.

## ✨ Features

- 🤖 **AI Sales Agent** — умный скрипт продаж на базе GPT-4o
- 🎤 **Voice Recognition** — голосовой ввод через Web Speech API
- 🔊 **Text-to-Speech** — озвучивание ответов бота
- 📱 **Telegram Notifications** — мгновенные уведомления о лидах
- 🔒 **Security** — rate limiting, validation, error handling
- 🐳 **Docker Ready** — контейнеризация для production
- 📊 **Logging** — структурированное логирование
- ♿ **Accessibility** — ARIA labels, keyboard navigation
- 📱 **Responsive** — адаптивный дизайн для всех устройств
- ⚡ **Performance** — оптимизированный код и кэширование

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend        │────▶│   OpenAI API    │
│   (Widget JS)   │     │   (Express.js)   │     │   (GPT-4o)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │
        │                       ▼
        │              ┌──────────────────┐
        │              │   Telegram Bot   │
        │              │   Notifications  │
        │              └──────────────────┘
        ▼
┌─────────────────┐
│   Your Website  │
└─────────────────┘
```

## 📦 Installation

### Quick Start

```bash
# Clone repository
git clone https://github.com/goqorhopar/neuro-sales-widget.git
cd neuro-sales-widget

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start development server
npm run dev

# Or start production server
npm start
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | OpenAI API key | - | ✅ |
| `OPENAI_MODEL` | Model name | `gpt-4o` | ❌ |
| `OPENAI_TEMPERATURE` | Temperature (0-1) | `0.3` | ❌ |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | - | ❌ |
| `TELEGRAM_CHAT_ID` | Chat ID(s), comma-separated | - | ❌ |
| `COMPANY_NAME` | Company name in widget | `lidorubov.net` | ❌ |
| `PORT` | Server port | `3000` | ❌ |
| `NODE_ENV` | Environment | `development` | ❌ |
| `CORS_ORIGIN` | CORS allowed origin | `*` | ❌ |
| `LOG_LEVEL` | Log level (ERROR/WARN/INFO/DEBUG) | `INFO` | ❌ |

### .env Example

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o
OPENAI_TEMPERATURE=0.3

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

# Server Configuration
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://yoursite.com

# Company Configuration
COMPANY_NAME=Your Company
SALES_SCRIPT_VERSION=2.0
```

## 🔧 Usage

### Embed on Your Website

```html
<!-- Add before closing </body> tag -->
<script>
  window.neuroSalesConfig = {
    apiUrl: 'https://your-api-domain.com/api',
    company: 'Your Company Name',
    scriptVersion: '2.0'
  };
</script>
<link rel="stylesheet" href="https://your-cdn.com/neuro-sales-widget.css">
<script src="https://your-cdn.com/neuro-sales-widget.js"></script>
```

### API Endpoints

#### POST /api/chat
Send a message to the AI sales agent.

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, I want to learn more about your services",
    "sessionId": "user-session-123"
  }'
```

Response:
```json
{
  "success": true,
  "response": "Hello! Welcome to Our Company...",
  "isLead": false,
  "leadStage": null,
  "requestId": "1234567890-abc123def"
}
```

#### GET /api/health
Health check endpoint.

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "success": true,
  "status": "ok",
  "version": "2.0",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

## 📁 Project Structure

```
neuro-sales-widget/
├── server/
│   ├── index.js              # Main server file
│   ├── middleware/
│   │   ├── errorHandler.js   # Error handling
│   │   └── validator.js      # Request validation & rate limiting
│   └── utils/
│       └── logger.js         # Structured logging
├── public/
│   ├── index.html            # Demo page
│   ├── neuro-sales-widget.js # Widget frontend
│   └── neuro-sales-widget.css # Widget styles
├── .env.example              # Environment template
├── .gitignore               # Git ignore rules
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose
├── package.json             # Dependencies
└── README.md                # Documentation
```

## 🛡️ Security Features

- **Rate Limiting**: 100 requests/minute per IP
- **Input Validation**: Message length, type checking
- **CORS Protection**: Configurable allowed origins
- **Error Handling**: Secure error messages
- **Request ID Tracking**: For debugging and monitoring
- **Graceful Shutdown**: Proper cleanup on termination

## 🧪 Testing

```bash
# Run tests (coming soon)
npm test

# Manual testing
# 1. Start server: npm run dev
# 2. Open http://localhost:3000
# 3. Click chat button and test conversation
```

## 📊 Monitoring

### Logs

Logs are output in JSON format for easy integration with log aggregators:

```json
{"timestamp":"2024-01-01T12:00:00.000Z","level":"INFO","message":"Chat request received","sessionId":"abc123","messageLength":45}
```

### Health Check

Use `/api/health` endpoint for monitoring:

```bash
# Kubernetes liveness probe
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 30
```

## 🚀 Production Deployment

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server/index.js --name neuro-sales-widget

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

### Using Docker

```bash
# Build image
docker build -t neuro-sales-widget:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name neuro-widget \
  neuro-sales-widget:latest
```

### Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

## 🔧 Troubleshooting

### Common Issues

**1. OpenAI API Errors**
- Check your API key is valid
- Ensure you have credits in your OpenAI account
- Verify network connectivity

**2. Telegram Notifications Not Working**
- Verify bot token is correct
- Ensure bot is added to the chat
- Check chat ID is valid

**3. Voice Recognition Not Working**
- Requires HTTPS in production
- Check browser support for Web Speech API
- Grant microphone permissions

**4. CORS Errors**
- Set `CORS_ORIGIN` environment variable
- Ensure frontend and backend domains match

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

- GitHub Issues: [Create an issue](https://github.com/goqorhopar/neuro-sales-widget/issues)
- Email: support@lidorubov.net

---

Made with ❤️ by [lidorubov.net](https://lidorubov.net)
