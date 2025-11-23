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
    it('should throw error when no OAuth credentials are configured', async () => {
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_SECRET;

      const { validateAuth } = await import('../../src/utils/google-auth.js');

      expect(() => validateAuth()).toThrow('Missing OAuth credentials');
    });

    it('should throw error when only CLIENT_ID is configured', async () => {
      process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
      delete process.env.GOOGLE_CLIENT_SECRET;

      const { validateAuth } = await import('../../src/utils/google-auth.js');

      expect(() => validateAuth()).toThrow('Missing OAuth credentials');
    });

    it('should throw error when only CLIENT_SECRET is configured', async () => {
      delete process.env.GOOGLE_CLIENT_ID;
      process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

      const { validateAuth } = await import('../../src/utils/google-auth.js');

      expect(() => validateAuth()).toThrow('Missing OAuth credentials');
    });

    it('should pass with both OAuth credentials configured', async () => {
      process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
      process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

      const { validateAuth } = await import('../../src/utils/google-auth.js');

      expect(() => validateAuth()).not.toThrow();
    });
  });

  describe('isAuthComplete', () => {
    it('should return false when no tokens exist', async () => {
      process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
      process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

      // Mock the token storage to simulate no tokens
      vi.doMock('../../src/utils/token-storage.js', () => ({
        loadTokens: vi.fn().mockResolvedValue(null),
        saveTokens: vi.fn().mockResolvedValue(undefined),
        hasValidTokens: vi.fn().mockResolvedValue(false),
        deleteTokens: vi.fn().mockResolvedValue(undefined),
        getTokensFilePath: vi.fn().mockReturnValue('/mock/path/tokens.json'),
        getCredentialsDir: vi.fn().mockReturnValue('/mock/path'),
      }));

      const { isAuthComplete } = await import('../../src/utils/google-auth.js');

      // With mocked token storage returning false, it should return false
      const result = await isAuthComplete();
      expect(result).toBe(false);
    });
  });

  describe('getAdsenseClient', () => {
    it('should be exported as async function', async () => {
      process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
      process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

      const { getAdsenseClient } = await import('../../src/utils/google-auth.js');

      expect(typeof getAdsenseClient).toBe('function');
    });
  });

  describe('resetClients', () => {
    it('should reset all cached clients', async () => {
      process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
      process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

      const { resetClients } = await import('../../src/utils/google-auth.js');

      // Should not throw
      expect(() => resetClients()).not.toThrow();
    });
  });
});
