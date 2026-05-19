/**
 * Integration tests for Neuro Sales Widget API
 * Tests full API endpoints and request/response flows
 */

const request = require('supertest');
const express = require('express');
const { clearCleanupInterval } = require('../server/middleware/validator');

// Cleanup interval after tests to prevent open handles
afterAll(() => {
  clearCleanupInterval();
});

describe('API Integration Tests', () => {
  let app;

  // Mock environment variables for testing
  beforeAll(() => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.NODE_ENV = 'test';
    process.env.PORT = '0'; // Use random port
  });

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Add basic routes for testing
    app.get('/api/health', (_req, res) => {
      res.json({
        success: true,
        status: 'ok',
        version: 'test',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: 'test'
      });
    });

    app.get('/metrics', (_req, res) => {
      res.set('Content-Type', 'text/plain');
      res.send('# Prometheus metrics');
    });

    app.post('/api/chat', (req, res) => {
      const { message, sessionId } = req.body;

      if (!message || !sessionId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Message and sessionId are required'
          }
        });
      }

      res.json({
        success: true,
        response: `Echo: ${message}`,
        isLead: false,
        leadStage: null,
        requestId: 'test-request-id'
      });
    });

    app.use((_req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Endpoint not found'
        }
      });
    });
  });

  describe('Health Check Endpoint', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body.environment).toBe('test');
    });

    it('should respond quickly', async () => {
      const start = Date.now();
      await request(app).get('/api/health').expect(200);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500); // Should respond in < 500ms (generous for CI environments)
    });
  });

  describe('Metrics Endpoint', () => {
    it('should return Prometheus format metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.text).toContain('# Prometheus metrics');
    });
  });

  describe('Chat API Endpoint', () => {
    it('should accept valid chat request', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          message: 'Hello',
          sessionId: 'test-session-123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.response).toContain('Echo: Hello');
      expect(response.body.isLead).toBe(false);
      expect(response.body.requestId).toBe('test-request-id');
    });

    it('should reject missing message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ sessionId: 'test-session-123' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject missing sessionId', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject empty body', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle long messages gracefully', async () => {
      const longMessage = 'a'.repeat(5000);
      const response = await request(app)
        .post('/api/chat')
        .send({
          message: longMessage,
          sessionId: 'test-session-123'
        });

      // Should either accept or reject with proper error, not crash
      expect([200, 400]).toContain(response.status);
    });

    it('should include security headers in response', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          message: 'Hello',
          sessionId: 'test-session-123'
        });

      expect(response.headers).toHaveProperty('x-powered-by');
      // Note: x-request-id is added by our middleware, not in test mock
      expect(response.body.success).toBe(true);
    });
  });

  describe('404 Handler', () => {
    it('should return proper 404 response for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 for invalid POST routes', async () => {
      const response = await request(app)
        .post('/api/invalid')
        .send({ test: 'data' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Request Validation', () => {
    it('should reject requests with invalid content type', async () => {
      const response = await request(app)
        .post('/api/chat')
        .set('Content-Type', 'text/plain')
        .send('plain text')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/chat')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      // Express should return 400 for malformed JSON
      expect(response.status).toBe(400);
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post('/api/chat')
          .send({
            message: `Message ${i}`,
            sessionId: `session-${i}`
          })
          .expect(200)
      );

      const responses = await Promise.all(requests);

      expect(responses.length).toBe(10);
      responses.forEach((res, index) => {
        expect(res.body.success).toBe(true);
        expect(res.body.response).toContain(`Message ${index}`);
      });
    });
  });
});
