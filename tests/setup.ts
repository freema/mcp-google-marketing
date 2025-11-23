import { vi } from 'vitest';

// Mock environment variables for testing
process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgtest\n-----END PRIVATE KEY-----';
process.env.GOOGLE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com';
process.env.GOOGLE_PROJECT_ID = 'test-project';
process.env.GOOGLE_ADS_DEVELOPER_TOKEN = 'test-developer-token';
process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID = '1234567890';

// Reset modules before each test
beforeEach(() => {
  vi.resetModules();
});

// Clean up after each test
afterEach(() => {
  vi.restoreAllMocks();
});
