// OAuth Scopes
export const GOOGLE_SCOPES = {
  ANALYTICS_EDIT: 'https://www.googleapis.com/auth/analytics.edit',
  ANALYTICS_READONLY: 'https://www.googleapis.com/auth/analytics.readonly',
  WEBMASTERS: 'https://www.googleapis.com/auth/webmasters',
  ADSENSE_READONLY: 'https://www.googleapis.com/auth/adsense.readonly',
} as const;

export const ALL_SCOPES = Object.values(GOOGLE_SCOPES);

// API Versions
export const API_VERSIONS = {
  GA4_ADMIN: 'v1',
  GA4_DATA: 'v1beta',
  SEARCH_CONSOLE: 'v1',
  ADSENSE: 'v2',
} as const;

// Rate Limits & Retry Configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  factor: 2,
} as const;

// GA4 Specific
export const GA4_LIMITS = {
  maxDimensionsPerReport: 9,
  maxMetricsPerReport: 10,
  maxRowsPerReport: 100000,
  maxCustomDimensions: 50,
  maxCustomMetrics: 50,
  adminApiRateLimit: 10, // requests per second
  dataApiConcurrentRequests: 10,
} as const;

// Search Console Specific
export const GSC_LIMITS = {
  maxRowsPerRequest: 25000,
  maxDateRange: 16, // months
} as const;

// AdSense Specific
export const ADSENSE_LIMITS = {
  maxRowsPerRequest: 50000,
} as const;

// ID Formats
export const ID_FORMATS = {
  GA4_ACCOUNT: /^accounts\/\d+$/,
  GA4_PROPERTY: /^properties\/\d+$/,
  GA4_DATA_STREAM: /^properties\/\d+\/dataStreams\/\d+$/,
  GSC_SITE_URL: /^(https?:\/\/|sc-domain:).+$/,
  ADSENSE_ACCOUNT: /^accounts\/pub-\d+$/,
} as const;

// Default Date Ranges
export const DEFAULT_DATE_RANGE = {
  startDate: '30daysAgo',
  endDate: 'today',
} as const;
