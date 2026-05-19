/**
 * Unit tests for utility functions
 * Tests helper functions, contact extraction, lead detection, etc.
 */

const { clearCleanupInterval } = require('../server/middleware/validator');

// Cleanup interval after tests to prevent open handles
afterAll(() => {
  clearCleanupInterval();
});

describe('Utility Functions', () => {
  describe('Contact Extraction', () => {
    const extractContacts = (message) => {
      const phoneRegex = /\+?[0-9]{1,4}?[-.\s]?\(?[0-9]{1,4}?\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}/g;
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;

      const phones = message.match(phoneRegex) || [];
      const emails = message.match(emailRegex) || [];
      const urls = message.match(urlRegex) || [];

      return {
        phones,
        emails,
        urls,
        hasContacts: phones.length > 0 || emails.length > 0 || urls.length > 0
      };
    };

    it('should extract phone numbers', () => {
      const result = extractContacts('My phone is +15551234567');
      expect(result.phones).toHaveLength(1);
      expect(result.hasContacts).toBe(true);
    });

    it('should extract email addresses', () => {
      const result = extractContacts('Email me at test@example.com');
      expect(result.emails).toHaveLength(1);
      expect(result.hasContacts).toBe(true);
    });

    it('should extract URLs', () => {
      const result = extractContacts('Visit https://example.com for more info');
      expect(result.urls).toHaveLength(1);
      expect(result.hasContacts).toBe(true);
    });

    it('should extract multiple contacts', () => {
      const result = extractContacts('Call +15551234567 or email test@example.com');
      expect(result.phones).toHaveLength(1);
      expect(result.emails).toHaveLength(1);
      expect(result.hasContacts).toBe(true);
    });

    it('should return empty when no contacts', () => {
      const result = extractContacts('Hello, how are you?');
      expect(result.phones).toHaveLength(0);
      expect(result.emails).toHaveLength(0);
      expect(result.urls).toHaveLength(0);
      expect(result.hasContacts).toBe(false);
    });
  });

  describe('Lead Stage Detection', () => {
    const detectLeadStage = (userMessage, _conversationHistory) => {
      const message = userMessage.toLowerCase();

      const triggers = {
        'zoom': 'Согласие на встречу',
        'встреча': 'Согласие на встречу',
        'телефон': 'Оставил контакты',
        'позвоните': 'Запрос звонка',
        'email': 'Оставил контакты',
        'интересует': 'Проявил интерес',
        'да': 'Проявил интерес',
      };

      for (const [keyword, stage] of Object.entries(triggers)) {
        if (message.includes(keyword) && stage) {
          return stage;
        }
      }

      return null;
    };

    it('should detect zoom agreement', () => {
      const result = detectLeadStage('Давайте встретимся в Zoom', []);
      expect(result).toBe('Согласие на встречу');
    });

    it('should detect phone request', () => {
      const result = detectLeadStage('Мой телефон +7-999-123-4567', []);
      expect(result).toBe('Оставил контакты');
    });

    it('should detect interest', () => {
      const result = detectLeadStage('Да, мне это интересно', []);
      expect(result).toBe('Проявил интерес');
    });

    it('should return null for non-lead messages', () => {
      const result = detectLeadStage('Просто вопрос', []);
      expect(result).toBeNull();
    });
  });

  describe('Client Needs Analysis', () => {
    const analyzeClientNeeds = (conversationText) => {
      const lowerText = conversationText.toLowerCase();
      const needs = [];

      // Check for average check mention
      const avgCheckMatch = lowerText.match(/средний чек[:\s]*([0-9\s.,]+)/i);
      if (avgCheckMatch) {
        needs.push(`Средний чек: ${avgCheckMatch[1].trim()}`);
      }

      // Check for advertising channels
      if (lowerText.includes('реклама') || lowerText.includes('рекламу')) {
        needs.push('Привлекает клиентов через рекламу');
      }

      // Check for website
      if (lowerText.includes('сайт') && !lowerText.includes('нет сайта')) {
        needs.push('Есть сайт');
      }

      // Check for Yandex Direct
      if (lowerText.includes('яндекс') && lowerText.includes('директ')) {
        needs.push('Использует Яндекс Директ');
      }

      // Check for sales department
      if (lowerText.includes('отдел продаж') || lowerText.includes('есть отдел')) {
        needs.push('Есть отдел продаж');
      }

      return needs;
    };

    it('should detect average check', () => {
      const result = analyzeClientNeeds('Наш средний чек 5000 рублей');
      expect(result).toContainEqual(expect.stringContaining('Средний чек'));
    });

    it('should detect advertising usage', () => {
      const result = analyzeClientNeeds('Мы используем рекламу для привлечения');
      expect(result).toContain('Привлекает клиентов через рекламу');
    });

    it('should detect website presence', () => {
      const result = analyzeClientNeeds('У нас есть сайт example.com');
      expect(result).toContain('Есть сайт');
    });

    it('should detect Yandex Direct', () => {
      const result = analyzeClientNeeds('Запускаем Яндекс Директ');
      expect(result).toContain('Использует Яндекс Директ');
    });

    it('should detect sales department', () => {
      const result = analyzeClientNeeds('У нас работает отдел продаж');
      expect(result).toContain('Есть отдел продаж');
    });

    it('should handle multiple needs', () => {
      const result = analyzeClientNeeds('Средний чек 10000, есть сайт, используем Яндекс Директ');
      expect(result.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Session ID Validation', () => {
    const isValidSessionId = (sessionId) => {
      if (!sessionId || typeof sessionId !== 'string') {return false;}
      if (sessionId.length > 256) {return false;}
      return /^[a-zA-Z0-9_-]+$/.test(sessionId);
    };

    it('should accept valid session IDs', () => {
      expect(isValidSessionId('session-123')).toBe(true);
      expect(isValidSessionId('user_abc_456')).toBe(true);
      expect(isValidSessionId('test123')).toBe(true);
    });

    it('should reject invalid session IDs', () => {
      expect(isValidSessionId('session<script>')).toBe(false);
      expect(isValidSessionId('session@#$%')).toBe(false);
      expect(isValidSessionId('')).toBe(false);
    });

    it('should reject too long session IDs', () => {
      const longId = 'a'.repeat(257);
      expect(isValidSessionId(longId)).toBe(false);
    });
  });

  describe('Message Sanitization', () => {
    const sanitizeMessage = (message) => {
      if (!message || typeof message !== 'string') {return '';}
      return message
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
    };

    it('should escape HTML tags', () => {
      const result = sanitizeMessage('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should escape quotes', () => {
      const result = sanitizeMessage('Test "quoted" text');
      expect(result).toContain('&quot;');
    });

    it('should trim whitespace', () => {
      const result = sanitizeMessage('  trimmed message  ');
      expect(result).toBe('trimmed message');
    });

    it('should handle empty input', () => {
      expect(sanitizeMessage('')).toBe('');
      expect(sanitizeMessage(null)).toBe('');
      expect(sanitizeMessage(undefined)).toBe('');
    });
  });
});
