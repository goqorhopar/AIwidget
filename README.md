# 🎯 Neuro Sales Widget - Enterprise Edition

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991.svg)](https://openai.com)
[![Telegram](https://img.shields.io/badge/Telegram-Notifications-blue.svg)](https://core.telegram.org/bots)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com)
[![Tests](https://img.shields.io/badge/tests-8%20passed-brightgreen)](.)
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

---

## 🚀 Quick Start

```bash
git clone https://github.com/goqorhopar/neuro-sales-widget.git
cd neuro-sales-widget
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

Visit `http://localhost:3000`

---

## ⚙️ Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | OpenAI API key | - | ✅ |
| `OPENAI_MODEL` | Model name | `gpt-4o` | ❌ |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | - | ❌ |
| `TELEGRAM_CHAT_ID` | Chat ID(s), comma-separated | - | ❌ |
| `COMPANY_NAME` | Company name | `lidorubov.net` | ❌ |
| `PORT` | Server port | `3000` | ❌ |
| `NODE_ENV` | Environment | `development` | ❌ |
| `CORS_ORIGIN` | Allowed origins | `*` | ❌ |

---

## 📡 API Endpoints

### POST /api/chat
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "sessionId": "user-123"}'
```

### GET /api/health
```bash
curl http://localhost:3000/api/health
```

### GET /metrics (Prometheus)
```bash
curl http://localhost:3000/metrics
```

---

## 🐳 Docker Deployment

```bash
# Build
docker build -t neuro-sales-widget:latest .

# Run
docker-compose up -d

# View logs
docker-compose logs -f
```

---

## 🧪 Testing

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
npm run lint          # ESLint
```

---

## 🔒 Security Features

- **Helmet.js**: CSP, HSTS, XSS protection, no-sniff
- **Rate Limiting**: 100 req/min per IP (configurable)
- **Input Validation**: express-validator, length limits
- **CORS**: Configurable origins, method restrictions
- **Error Handling**: No internal error leaks
- **Request ID**: UUID tracking for audit trails

---

## 📊 Monitoring

### Logging (Winston)
- JSON format in production
- Colored console in development
- File rotation (production)

### Metrics (Prometheus)
- `http_requests_total`
- `http_request_duration_seconds`
- `chat_requests_total`
- `active_connections`

---

## 📁 Project Structure

```
neuro-sales-widget/
├── server/
│   ├── config/           # Configuration management
│   ├── middleware/       # Error handling, validation
│   ├── utils/            # Logger utility
│   └── index.js          # Main server file
├── public/
│   ├── index.html        # Demo page
│   ├── neuro-sales-widget.js
│   └── neuro-sales-widget.css
├── tests/                # Jest tests
├── .env.example          # Environment template
├── docker-compose.yml    # Docker Compose
├── Dockerfile            # Docker config
├── package.json          # Dependencies
└── README.md             # Documentation
```

---

## 🔧 Troubleshooting

**OpenAI API Errors**: Check API key, credits, connectivity
**Telegram Not Working**: Verify bot token, chat ID, bot in chat
**Voice Not Working**: Requires HTTPS, check browser support
**CORS Errors**: Set `CORS_ORIGIN` to your domain

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

Made with ❤️ by [lidorubov.net](https://lidorubov.net)
