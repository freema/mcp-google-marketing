import { vi } from 'vitest';

// Mock GA4 Admin Client
export const mockAnalyticsAdminClient = {
  listAccountSummaries: vi.fn(),
  listProperties: vi.fn(),
  createProperty: vi.fn(),
  getProperty: vi.fn(),
  updateProperty: vi.fn(),
  deleteProperty: vi.fn(),
  listDataStreams: vi.fn(),
  createDataStream: vi.fn(),
  updateDataStream: vi.fn(),
  listConversionEvents: vi.fn(),
  createConversionEvent: vi.fn(),
  deleteConversionEvent: vi.fn(),
  listCustomDimensions: vi.fn(),
  createCustomDimension: vi.fn(),
  listCustomMetrics: vi.fn(),
  createCustomMetric: vi.fn(),
};

// Mock GA4 Data Client
export const mockAnalyticsDataClient = {
  runRealtimeReport: vi.fn(),
  runReport: vi.fn(),
  runPivotReport: vi.fn(),
  batchRunReports: vi.fn(),
};

// Mock Search Console Client
export const mockSearchConsoleClient = {
  sites: {
    list: vi.fn(),
    get: vi.fn(),
  },
  searchanalytics: {
    query: vi.fn(),
  },
  sitemaps: {
    list: vi.fn(),
    submit: vi.fn(),
    delete: vi.fn(),
  },
};

// Mock Google Auth JWT
export const mockAuthJWT = {
  getAccessToken: vi.fn().mockResolvedValue({ token: 'mock-access-token' }),
};

// Setup mocks
export function setupMocks() {
  vi.mock('@google-analytics/admin', () => ({
    AnalyticsAdminServiceClient: vi.fn(() => mockAnalyticsAdminClient),
  }));

  vi.mock('@google-analytics/data', () => ({
    BetaAnalyticsDataClient: vi.fn(() => mockAnalyticsDataClient),
  }));

  vi.mock('googleapis', () => ({
    google: {
      auth: {
        JWT: vi.fn(() => mockAuthJWT),
      },
      searchconsole: vi.fn(() => mockSearchConsoleClient),
    },
  }));
}
