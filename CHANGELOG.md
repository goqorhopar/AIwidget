# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-01-01

### Added
- **Security**: Rate limiting middleware (100 req/min per IP)
- **Security**: Input validation for chat requests
- **Security**: Configurable CORS with environment variable
- **Logging**: Structured JSON logging utility
- **Error Handling**: Global error handler with AppError class
- **Monitoring**: Enhanced health check endpoint with uptime and environment info
- **Reliability**: Graceful shutdown handling (SIGTERM)
- **Reliability**: Uncaught exception and unhandled rejection handlers
- **Performance**: Conversation history limit to prevent memory leaks
- **Performance**: Static asset caching with maxAge
- **DX**: Request ID tracking for debugging
- **DX**: CI/CD pipeline with GitHub Actions
- **DevOps**: Docker and Docker Compose configuration
- **Documentation**: Comprehensive README with architecture diagram
- **Demo**: Interactive demo page at `/`

### Changed
- **Breaking**: Updated OpenAI model from `gpt-5` to `gpt-4o` (production-ready)
- **API**: Chat endpoint now returns `success` field and `requestId`
- **API**: Error responses now follow consistent format with `code` and `message`
- **Configuration**: Moved all config to environment variables
- **Dependencies**: Updated package.json with proper metadata

### Fixed
- Memory leak from unlimited conversation history growth
- Missing error handling for OpenAI API failures
- Missing error handling for Telegram notification failures
- Inconsistent response formats
- Missing 404 handler for unknown routes
- Security vulnerability from unconstrained input

### Removed
- Direct console.log statements (replaced with logger)
- Blocking Telegram notifications (now async, non-blocking)

## [1.0.0] - Previous Version

### Features
- Basic chat widget with GPT integration
- Voice recognition support
- Telegram notifications
- Sales script implementation
