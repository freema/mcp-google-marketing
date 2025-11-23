import { vi } from 'vitest';

// Mock environment variables for testing (OAuth)
process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

// Reset modules before each test
beforeEach(() => {
  vi.resetModules();
});

// Clean up after each test
afterEach(() => {
  vi.restoreAllMocks();
});
