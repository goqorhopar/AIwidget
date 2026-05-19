# 🎯 Neuro Sales Widget - Enterprise Edition

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991.svg)](https://openai.com)
[![Telegram](https://img.shields.io/badge/Telegram-Notifications-blue.svg)](https://core.telegram.org/bots)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com)
[![Tests](https://img.shields.io/badge/tests-46%20passed-brightgreen)](.)
[![Coverage](https://img.shields.io/badge/coverage-65%25-yellowgreen)](.)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Production-ready AI sales chatbot** with GPT-4o integration, voice recognition, Telegram notifications, and enterprise-grade security.

---

## ✨ Features

### Core Functionality
- 🤖 **AI Sales Agent** — Intelligent sales script powered by GPT-4o
- 🎤 **Voice Recognition** — Real-time speech-to-text via Web Speech API
- 🔊 **Text-to-Speech** — Voice responses from the AI agent
- 📱 **Telegram Notifications** — Instant lead alerts to multiple recipients
- 💬 **Contextual Conversations** — Maintains conversation history and context

### Enterprise Features
- 🔒 **Security Hardening** — Helmet.js, rate limiting, input validation, CORS
- 📊 **Observability** — Winston logging, Prometheus metrics, request tracking
- 🚀 **Performance** — Memory leak prevention, caching, graceful shutdown
- ♿ **Accessibility** — ARIA labels, keyboard navigation, screen reader support
- 📱 **Responsive** — Mobile-first, adaptive design, touch-friendly

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Express Server │────▶│  OpenAI API │
│   (Widget)  │     │  (Security/Logs) │     │   (GPT-4o)  │
└─────────────┘     └──────────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Telegram   │
                    │   Bot API   │
                    └─────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Vanilla JS + CSS3 | Lightweight widget with no dependencies |
| **Backend** | Node.js + Express | RESTful API with middleware stack |
| **AI** | OpenAI GPT-4o | Natural language processing |
| **Logging** | Winston | Structured JSON logging |
| **Metrics** | Prometheus | Performance monitoring |
| **Security** | Helmet + express-rate-limit | Security headers & rate limiting |
| **Validation** | express-validator | Input sanitization & validation |
| **Deployment** | Docker + docker-compose | Containerized deployment |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key
- (Optional) Telegram bot token

### Installation

```bash
# Clone repository
git clone https://github.com/goqorhopar/neuro-sales-widget.git
cd neuro-sales-widget

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# Required: OPENAI_API_KEY
nano .env

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the demo page.

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | OpenAI API key | - | ✅ |
| `OPENAI_MODEL` | Model name | `gpt-4o` | ❌ |
| `OPENAI_TEMPERATURE` | AI creativity (0.0-1.0) | `0.3` | ❌ |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | - | ❌ |
| `TELEGRAM_CHAT_ID` | Chat ID(s), comma-separated | - | ❌ |
| `COMPANY_NAME` | Company name | `lidorubov.net` | ❌ |
| `SALES_SCRIPT_VERSION` | Script version | `2.0` | ❌ |
| `PORT` | Server port | `3000` | ❌ |
| `NODE_ENV` | Environment | `development` | ❌ |
| `CORS_ORIGIN` | Allowed origins | `*` | ❌ |
| `RATE_LIMIT_MAX` | Max requests per window | `100` | ❌ |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `60000` | ❌ |
| `LOG_LEVEL` | Logging level | `INFO` | ❌ |
| `MAX_MESSAGE_LENGTH` | Max message length | `2000` | ❌ |

### Example .env File

```bash
# OpenAI
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o
OPENAI_TEMPERATURE=0.3

# Telegram (optional)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=123456789,987654321

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

# Company
COMPANY_NAME=Your Company
```

---

## 📡 API Endpoints

### POST /api/chat

Send a message to the AI sales agent.

**Request:**
```json
{
  "message": "Hello, I'm interested in your services",
  "sessionId": "unique-user-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Hello! Thank you for your interest...",
  "isLead": true,
  "leadStage": "Проявил интерес",
  "requestId": "uuid-v4-request-id"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "sessionId": "user-123"}'
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "status": "ok",
  "version": "2.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345.67,
  "environment": "production"
}
```

### GET /metrics

Prometheus metrics endpoint.

**Metrics Available:**
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration histogram
- `chat_requests_total` - Chat API requests
- `active_connections` - Current active connections
- Plus default Node.js metrics (memory, CPU, event loop)

---

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t neuro-sales-widget:latest .
```

### Run with Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Run

```bash
docker run -d \
  --name neuro-sales-widget \
  -p 3000:3000 \
  -e OPENAI_API_KEY=your-key \
  -e NODE_ENV=production \
  neuro-sales-widget:latest
```

### Health Check

The container includes a built-in health check:
```bash
docker inspect --format='{{.State.Health.Status}}' neuro-sales-widget
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Lint code
npm run lint

# Fix lint issues automatically
npx eslint --fix .
```

### Test Coverage

Current coverage report:
- **Statements:** 65%
- **Branches:** 48%
- **Functions:** 33%
- **Lines:** 65%

Coverage reports are generated in `coverage/` directory.

---

## 🔒 Security Features

### Implemented Security Measures

| Feature | Implementation | Status |
|---------|---------------|--------|
| **Helmet.js** | CSP, HSTS, XSS protection, no-sniff | ✅ |
| **Rate Limiting** | 100 req/min per IP (configurable) | ✅ |
| **Input Validation** | express-validator, length limits | ✅ |
| **CORS** | Configurable origins, method restrictions | ✅ |
| **Error Handling** | No internal error leaks | ✅ |
| **Request ID** | UUID tracking for audit trails | ✅ |
| **SQL Injection** | N/A (No SQL database) | ✅ |
| **XSS Protection** | HTML escaping, CSP headers | ✅ |
| **CSRF Protection** | Stateless API design | ✅ |

### Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 📊 Monitoring

### Logging (Winston)

**Development Mode:**
- Colored console output
- Human-readable format

**Production Mode:**
- JSON structured logging
- File rotation (10MB max, 5 files)
- Log levels: ERROR, WARN, INFO, DEBUG

**Example Log Entry:**
```json
{
  "level": "info",
  "message": "Chat response sent",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "neuro-sales-widget",
  "sessionId": "abc123",
  "isLead": true
}
```

### Metrics (Prometheus)

Access metrics at `/metrics`:

```prometheus
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="POST",route="/api/chat",status_code="200"} 150

# HELP http_request_duration_seconds Duration of HTTP requests in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.5"} 120
http_request_duration_seconds_bucket{le="1"} 145

# HELP active_connections Number of active connections
# TYPE active_connections gauge
active_connections 5
```

### Grafana Integration

Import the Prometheus data source into Grafana for dashboards:
1. Add Prometheus data source (http://your-server:3000/metrics)
2. Import dashboard templates from `grafana/` (coming soon)

---

## 📁 Project Structure

```
neuro-sales-widget/
├── server/
│   ├── config/           # Configuration management
│   │   └── index.js      # Centralized config with validation
│   ├── middleware/       # Express middleware
│   │   ├── errorHandler.js  # Global error handling
│   │   └── validator.js     # Request validation & rate limiting
│   ├── utils/            # Utility modules
│   │   └── logger.js     # Winston logger configuration
│   └── index.js          # Main server entry point
├── public/
│   ├── index.html        # Demo page
│   ├── neuro-sales-widget.js   # Frontend widget logic
│   └── neuro-sales-widget.css  # Widget styles
├── tests/
│   ├── integration.test.js   # API integration tests
│   ├── middleware.test.js    # Middleware unit tests
│   └── utils.test.js         # Utility function tests
├── .github/
│   └── workflows/        # CI/CD pipelines
│       ├── ci.yml        # Lint & test workflow
│       └── deploy.yml    # Production deployment
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile           # Docker image definition
├── package.json         # Dependencies & scripts
├── README.md            # This file
├── CHANGELOG.md         # Version history
└── INSTALLATION_GUIDE.md # Integration instructions
```

---

## 🔧 Troubleshooting

### OpenAI API Errors

**Problem:** `Failed to get AI response`

**Solutions:**
1. Verify API key is correct in `.env`
2. Check OpenAI account has available credits
3. Ensure network connectivity to `api.openai.com`
4. Check rate limits on your OpenAI plan

### Telegram Not Working

**Problem:** No notifications received

**Solutions:**
1. Verify bot token via @BotFather
2. Confirm chat ID is correct (use @userinfobot)
3. Ensure bot is added to the chat/group
4. Check bot has send messages permission

### Voice Recognition Issues

**Problem:** Microphone button not working

**Solutions:**
1. HTTPS is required for Web Speech API
2. Grant microphone permission in browser
3. Check browser compatibility (Chrome recommended)
4. Verify audio input device is connected

### CORS Errors

**Problem:** `Access-Control-Allow-Origin` errors

**Solutions:**
1. Set `CORS_ORIGIN` to your domain in `.env`
2. For multiple domains, use comma-separated list
3. Avoid `*` in production environments

### Memory Issues

**Problem:** High memory usage over time

**Solutions:**
1. Conversation history is auto-limited to 20 messages
2. Sessions expire after 1 hour (configurable)
3. Monitor with Prometheus metrics
4. Consider Redis for session storage in clusters

---

## 📈 Performance Benchmarks

| Metric | Value | Conditions |
|--------|-------|------------|
| **Avg Response Time** | < 500ms | Local development |
| **Avg Response Time** | < 2s | Production (GPT-4o) |
| **Concurrent Users** | 100+ | Single instance |
| **Memory Usage** | ~150MB | Idle |
| **Memory Usage** | ~300MB | Under load |
| **Startup Time** | < 3s | Cold start |

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

**CI Pipeline (on PR/push):**
1. Checkout code
2. Setup Node.js (18.x, 20.x)
3. Install dependencies
4. Syntax validation
5. Run tests with coverage
6. Build Docker image
7. Test Docker container

**CD Pipeline (on main branch):**
1. All CI steps
2. Deploy to production server via SSH
3. Restart PM2 process
4. Health check verification

### Manual Deployment

```bash
# Pull latest changes
git pull origin main

# Install production dependencies
npm ci --only=production

# Restart with PM2
pm2 restart neuro-sales-widget

# Verify health
curl http://localhost:3000/api/health
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure linting passes (`npm run lint`)
- All tests must pass (`npm test`)

---

## 📞 Support

- **Documentation:** [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
- **Issues:** [GitHub Issues](https://github.com/goqorhopar/neuro-sales-widget/issues)
- **Author:** [lidorubov.net](https://lidorubov.net)

---

## 🎯 Roadmap

- [ ] Redis session storage for clustering
- [ ] Multi-language support
- [ ] Custom sales script builder UI
- [ ] Analytics dashboard
- [ ] A/B testing for sales scripts
- [ ] CRM integrations (Salesforce, HubSpot)
- [ ] WhatsApp notifications
- [ ] Advanced analytics with Google Analytics integration

---

Made with ❤️ by [lidorubov.net](https://lidorubov.net)
