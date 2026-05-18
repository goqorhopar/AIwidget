/**
 * @jest-environment node
 */

const request = require('supertest');
const express = require('express');
const { validateChatRequestRules, validateChatRequest, clearCleanupInterval } = require('../server/middleware/validator');
const { AppError, errorHandler } = require('../server/middleware/errorHandler');

// Cleanup interval after tests to prevent open handles
afterAll(() => {
  clearCleanupInterval();
});

describe('Validator Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('validateChatRequest', () => {
    it('should pass valid request', async () => {
      app.post('/test',
        validateChatRequestRules,
        validateChatRequest,
        (req, res) => res.json({ success: true })
      );

      const response = await request(app)
        .post('/test')
        .send({ message: 'Hello', sessionId: 'session-123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject empty message', async () => {
      app.post('/test',
        validateChatRequestRules,
        validateChatRequest,
        (req, res) => res.json({ success: true }),
        errorHandler
      );

      const response = await request(app)
        .post('/test')
        .send({ message: '', sessionId: 'session-123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject missing sessionId', async () => {
      app.post('/test',
        validateChatRequestRules,
        validateChatRequest,
        (req, res) => res.json({ success: true }),
        errorHandler
      );

      const response = await request(app)
        .post('/test')
        .send({ message: 'Hello' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject message over 2000 characters', async () => {
      app.post('/test',
        validateChatRequestRules,
        validateChatRequest,
        (req, res) => res.json({ success: true }),
        errorHandler
      );

      const longMessage = 'a'.repeat(2001);
      const response = await request(app)
        .post('/test')
        .send({ message: longMessage, sessionId: 'session-123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should sanitize input to prevent XSS', async () => {
      app.post('/test',
        validateChatRequestRules,
        validateChatRequest,
        (req, res) => res.json({ success: true, message: req.body.message })
      );

      const xssMessage = '<script>alert("xss")</script>Hello';
      const response = await request(app)
        .post('/test')
        .send({ message: xssMessage, sessionId: 'session-123' });

      expect(response.status).toBe(200);
      // The message should be escaped
      expect(response.body.message).not.toContain('<script>');
    });

    it('should reject sessionId over 256 characters', async () => {
      app.post('/test',
        validateChatRequestRules,
        validateChatRequest,
        (req, res) => res.json({ success: true }),
        errorHandler
      );

      const longSessionId = 's'.repeat(257);
      const response = await request(app)
        .post('/test')
        .send({ message: 'Hello', sessionId: longSessionId });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});

describe('AppError', () => {
  it('should create error with default values', () => {
    const error = new AppError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.isOperational).toBe(true);
  });

  it('should create error with custom values', () => {
    const error = new AppError('Custom error', 404, 'NOT_FOUND');
    expect(error.message).toBe('Custom error');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });
});

describe('Error Handler Middleware', () => {
  it('should handle operational errors correctly', () => {
    const error = new AppError('Test error', 400, 'BAD_REQUEST');

    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'BAD_REQUEST',
          message: 'Test error'
        })
      })
    );
  });

  it('should not leak internal error details in production', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('Internal error');
    error.isOperational = false;

    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'Something went wrong. Please try again later.',
          code: 'INTERNAL_ERROR'
        })
      })
    );

    process.env.NODE_ENV = 'test';
  });
});
