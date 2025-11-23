import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('google-auth', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateAuth', () => {
    it('should throw error when no authentication method is configured', async () => {
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
      delete process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      delete process.env.GOOGLE_PRIVATE_KEY;
      delete process.env.GOOGLE_CLIENT_EMAIL;

      const { validateAuth } = await import('../../src/utils/google-auth.js');

      expect(() => validateAuth()).toThrow('No authentication method provided');
    });

    it('should pass with file-based authentication', async () => {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = '/path/to/credentials.json';

      const { validateAuth } = await import('../../src/utils/google-auth.js');

      expect(() => validateAuth()).not.toThrow();
    });

    it('should pass with JSON string authentication', async () => {
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY = JSON.stringify({
        type: 'service_account',
        private_key: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----',
        client_email: 'test@test.iam.gserviceaccount.com',
        project_id: 'test-project',
      });

      const { validateAuth } = await import('../../src/utils/google-auth.js');

      expect(() => validateAuth()).not.toThrow();
    });

    it('should pass with private key authentication', async () => {
      process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';
      process.env.GOOGLE_CLIENT_EMAIL = 'test@test.iam.gserviceaccount.com';

      const { validateAuth } = await import('../../src/utils/google-auth.js');

      expect(() => validateAuth()).not.toThrow();
    });

    it('should throw error for invalid private key format', async () => {
      process.env.GOOGLE_PRIVATE_KEY = 'invalid-key';
      process.env.GOOGLE_CLIENT_EMAIL = 'test@test.iam.gserviceaccount.com';

      const { validateAuth } = await import('../../src/utils/google-auth.js');

      expect(() => validateAuth()).toThrow('GOOGLE_PRIVATE_KEY appears to be invalid');
    });

    it('should throw error for invalid email format', async () => {
      process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';
      process.env.GOOGLE_CLIENT_EMAIL = 'invalid-email';

      const { validateAuth } = await import('../../src/utils/google-auth.js');

      expect(() => validateAuth()).toThrow('GOOGLE_CLIENT_EMAIL appears to be invalid');
    });

    it('should throw error for invalid JSON in service account key', async () => {
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY = 'not-valid-json';

      const { validateAuth } = await import('../../src/utils/google-auth.js');

      expect(() => validateAuth()).toThrow('invalid JSON');
    });

    it('should throw error for missing type in service account key', async () => {
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY = JSON.stringify({
        private_key: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----',
        client_email: 'test@test.iam.gserviceaccount.com',
      });

      const { validateAuth } = await import('../../src/utils/google-auth.js');

      expect(() => validateAuth()).toThrow('type must be "service_account"');
    });
  });

  describe('getAdsenseClient', () => {
    it('should be exported as async function', async () => {
      process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';
      process.env.GOOGLE_CLIENT_EMAIL = 'test@test.iam.gserviceaccount.com';

      const { getAdsenseClient } = await import('../../src/utils/google-auth.js');

      expect(typeof getAdsenseClient).toBe('function');
    });
  });

  describe('resetClients', () => {
    it('should reset all cached clients', async () => {
      process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';
      process.env.GOOGLE_CLIENT_EMAIL = 'test@test.iam.gserviceaccount.com';

      const { resetClients } = await import('../../src/utils/google-auth.js');

      // Should not throw
      expect(() => resetClients()).not.toThrow();
    });
  });
});
