# MCP Google Marketing Server - Implementation Plan

## Project Overview

Create a Model Context Protocol (MCP) server providing unified access to Google's marketing platform APIs:
- **Google Analytics 4** (GA4) - Data API v1 & Admin API v1
- **Google Search Console** - Search Console API v1
- **Google Ads** - Google Ads API v17

**Repository:** mcp-google-marketing
**Language:** TypeScript/Node.js
**Architecture:** Based on mcp-gsheets patterns

---

## Phase 1: Project Setup & Foundation

### Task 1.1: Initialize Project Structure

```
mcp-google-marketing/
├── src/
│   ├── index.ts                    # MCP server entry point
│   ├── config/
│   │   └── constants.ts            # API versions, scopes, limits, retry config
│   ├── services/
│   │   ├── analytics.ts            # GA4 API client wrapper
│   │   ├── search-console.ts       # Search Console client wrapper
│   │   └── ads.ts                  # Google Ads client wrapper
│   ├── tools/
│   │   ├── analytics/              # GA4 tools (one file per tool)
│   │   │   ├── list-accounts.ts
│   │   │   ├── list-properties.ts
│   │   │   ├── create-property.ts
│   │   │   ├── get-property.ts
│   │   │   ├── update-property.ts
│   │   │   ├── delete-property.ts
│   │   │   ├── list-data-streams.ts
│   │   │   ├── create-web-stream.ts
│   │   │   ├── create-app-stream.ts
│   │   │   ├── update-data-stream.ts
│   │   │   ├── get-measurement-id.ts
│   │   │   ├── list-custom-events.ts
│   │   │   ├── create-custom-event.ts
│   │   │   ├── list-conversion-events.ts
│   │   │   ├── create-conversion-event.ts
│   │   │   ├── delete-conversion-event.ts
│   │   │   ├── get-realtime.ts
│   │   │   ├── run-report.ts
│   │   │   ├── run-pivot-report.ts
│   │   │   ├── batch-run-reports.ts
│   │   │   ├── list-custom-dimensions.ts
│   │   │   ├── create-custom-dimension.ts
│   │   │   ├── list-custom-metrics.ts
│   │   │   ├── create-custom-metric.ts
│   │   │   └── index.ts            # GA4 tools barrel export
│   │   ├── search-console/         # Search Console tools
│   │   │   ├── list-sites.ts
│   │   │   ├── get-site.ts
│   │   │   ├── search-analytics.ts
│   │   │   ├── list-sitemaps.ts
│   │   │   ├── submit-sitemap.ts
│   │   │   ├── delete-sitemap.ts
│   │   │   └── index.ts            # Search Console tools barrel export
│   │   ├── ads/                    # Google Ads tools
│   │   │   ├── list-accounts.ts
│   │   │   ├── get-account.ts
│   │   │   ├── get-campaigns.ts
│   │   │   ├── campaign-performance.ts
│   │   │   ├── get-keywords.ts
│   │   │   ├── keyword-performance.ts
│   │   │   └── index.ts            # Ads tools barrel export
│   │   └── index.ts                # Central tool exports
│   ├── types/
│   │   ├── common.ts               # Shared types (DateRange, etc.)
│   │   ├── analytics.ts            # GA4 specific types
│   │   ├── search-console.ts       # Search Console types
│   │   ├── ads.ts                  # Google Ads types
│   │   └── index.ts                # Type exports
│   └── utils/
│       ├── google-auth.ts          # Multi-service authentication
│       ├── error-handler.ts        # Error handling utilities
│       ├── error-messages.ts       # Centralized error messages
│       ├── validators.ts           # Input validation functions
│       ├── formatters.ts           # Response formatting
│       └── index.ts                # Utils exports
├── tests/
│   ├── setup.ts
│   ├── fixtures/
│   ├── mocks/
│   ├── unit/
│   └── integration/
├── scripts/
│   └── setup.sh
├── .env.example
├── .gitignore
├── .eslintrc.json
├── .prettierrc.json
├── Dockerfile
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── README.md
```

### Task 1.2: Configure package.json

```json
{
  "name": "mcp-google-marketing",
  "version": "1.0.0",
  "description": "MCP server for Google Analytics 4, Search Console, and Google Ads",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "mcp-google-marketing": "dist/index.js"
  },
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup",
    "start": "node dist/index.js",
    "inspector": "npx @modelcontextprotocol/inspector node dist/index.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\"",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "check": "npm run typecheck && npm run lint && npm run format:check",
    "check:all": "npm run check && npm run test:run && npm run build"
  },
  "dependencies": {
    "@google-analytics/admin": "^4.0.0",
    "@google-analytics/data": "^4.0.0",
    "@modelcontextprotocol/sdk": "^1.0.0",
    "google-ads-api": "^17.0.0",
    "googleapis": "^140.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "dotenv": "^16.0.0",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "prettier": "^3.0.0",
    "tsup": "^8.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.5.0",
    "vitest": "^1.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Task 1.3: TypeScript Configuration

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noEmitOnError": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**tsup.config.ts:**
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  dts: true,
  splitting: false,
  sourcemap: false,
  minify: false,
  noExternal: ['@modelcontextprotocol/sdk', 'zod'],
  external: [
    '@google-analytics/admin',
    '@google-analytics/data',
    'googleapis',
    'google-ads-api',
  ],
});
```

---

## Phase 2: Authentication System

### Task 2.1: Configuration Constants

**src/config/constants.ts:**
```typescript
// OAuth Scopes
export const GOOGLE_SCOPES = {
  ANALYTICS_EDIT: 'https://www.googleapis.com/auth/analytics.edit',
  ANALYTICS_READONLY: 'https://www.googleapis.com/auth/analytics.readonly',
  WEBMASTERS: 'https://www.googleapis.com/auth/webmasters',
  ADWORDS: 'https://www.googleapis.com/auth/adwords',
};

export const ALL_SCOPES = Object.values(GOOGLE_SCOPES);

// API Versions
export const API_VERSIONS = {
  GA4_ADMIN: 'v1',
  GA4_DATA: 'v1beta',
  SEARCH_CONSOLE: 'v1',
  GOOGLE_ADS: 'v17',
};

// Rate Limits & Retry Configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  factor: 2,
};

// GA4 Specific
export const GA4_LIMITS = {
  maxDimensionsPerReport: 9,
  maxMetricsPerReport: 10,
  maxRowsPerReport: 100000,
  maxCustomDimensions: 50,
  maxCustomMetrics: 50,
  adminApiRateLimit: 10, // requests per second
  dataApiConcurrentRequests: 10,
};

// Search Console Specific
export const GSC_LIMITS = {
  maxRowsPerRequest: 25000,
  maxDateRange: 16, // months
};

// Google Ads Specific
export const ADS_LIMITS = {
  maxRowsPerRequest: 10000,
};

// ID Formats
export const ID_FORMATS = {
  GA4_ACCOUNT: /^accounts\/\d+$/,
  GA4_PROPERTY: /^properties\/\d+$/,
  GA4_DATA_STREAM: /^properties\/\d+\/dataStreams\/\d+$/,
  GSC_SITE_URL: /^(https?:\/\/|sc-domain:).+$/,
  ADS_CUSTOMER_ID: /^\d{10}$/,
};

// Default Date Ranges
export const DEFAULT_DATE_RANGE = {
  startDate: '30daysAgo',
  endDate: 'today',
};
```

### Task 2.2: Multi-Service Authentication

**src/utils/google-auth.ts:**
```typescript
import { GoogleAuth, JWT } from 'google-auth-library';
import { AnalyticsAdminServiceClient } from '@google-analytics/admin';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { google } from 'googleapis';
import { GoogleAdsApi } from 'google-ads-api';
import { ALL_SCOPES, GOOGLE_SCOPES } from '../config/constants.js';

// Authentication methods (priority order):
// 1. GOOGLE_APPLICATION_CREDENTIALS - path to service account JSON
// 2. GOOGLE_SERVICE_ACCOUNT_KEY - full JSON as string
// 3. GOOGLE_PRIVATE_KEY + GOOGLE_CLIENT_EMAIL - individual values

let authClient: GoogleAuth | JWT | null = null;
let analyticsAdminClient: AnalyticsAdminServiceClient | null = null;
let analyticsDataClient: BetaAnalyticsDataClient | null = null;
let searchConsoleClient: ReturnType<typeof google.searchconsole> | null = null;
let adsClient: GoogleAdsApi | null = null;

export function validateAuth(): void {
  const hasCredentialsFile = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const hasServiceAccountKey = !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const hasKeyPair = !!process.env.GOOGLE_PRIVATE_KEY && !!process.env.GOOGLE_CLIENT_EMAIL;

  if (!hasCredentialsFile && !hasServiceAccountKey && !hasKeyPair) {
    throw new Error(
      'Google authentication not configured. Provide one of:\n' +
      '1. GOOGLE_APPLICATION_CREDENTIALS (path to service account JSON)\n' +
      '2. GOOGLE_SERVICE_ACCOUNT_KEY (full JSON as string)\n' +
      '3. GOOGLE_PRIVATE_KEY + GOOGLE_CLIENT_EMAIL'
    );
  }
}

export async function getAuthClient(): Promise<GoogleAuth | JWT> {
  if (authClient) return authClient;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    authClient = new GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ALL_SCOPES,
    });
  } else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    authClient = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ALL_SCOPES,
    });
  } else if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL) {
    authClient = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ALL_SCOPES,
    });
  } else {
    throw new Error('No valid authentication method found');
  }

  return authClient;
}

// GA4 Admin API Client
export async function getAnalyticsAdminClient(): Promise<AnalyticsAdminServiceClient> {
  if (analyticsAdminClient) return analyticsAdminClient;

  const auth = await getAuthClient();
  analyticsAdminClient = new AnalyticsAdminServiceClient({ auth });
  return analyticsAdminClient;
}

// GA4 Data API Client
export async function getAnalyticsDataClient(): Promise<BetaAnalyticsDataClient> {
  if (analyticsDataClient) return analyticsDataClient;

  const auth = await getAuthClient();
  analyticsDataClient = new BetaAnalyticsDataClient({ auth });
  return analyticsDataClient;
}

// Search Console API Client
export async function getSearchConsoleClient() {
  if (searchConsoleClient) return searchConsoleClient;

  const auth = await getAuthClient();
  searchConsoleClient = google.searchconsole({ version: 'v1', auth });
  return searchConsoleClient;
}

// Google Ads API Client
export async function getAdsClient(): Promise<GoogleAdsApi> {
  if (adsClient) return adsClient;

  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  if (!developerToken) {
    throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN is required for Google Ads API');
  }

  let credentials;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credentials = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  } else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  } else {
    credentials = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
  }

  adsClient = new GoogleAdsApi({
    client_id: credentials.client_id || process.env.GOOGLE_CLIENT_ID,
    client_secret: credentials.client_secret || process.env.GOOGLE_CLIENT_SECRET,
    developer_token: developerToken,
  });

  return adsClient;
}
```

---

## Phase 3: Google Analytics 4 Tools

### Tool Naming Convention
All GA4 tools prefixed with `ga4_`

### Task 3.1: GA4 Management Tools

**ga4_list_accounts**
```typescript
// List all GA4 accounts accessible by service account
Input: {} (no required params)
Output: Array of { accountId, displayName, createTime, updateTime }
```

**ga4_list_properties**
```typescript
// List properties under an account
Input: { accountId: string } // "accounts/123456"
Output: Array of { propertyId, displayName, timeZone, currencyCode, industryCategory }
```

**ga4_create_property**
```typescript
// Create new GA4 property
Input: {
  accountId: string,       // "accounts/123456"
  displayName: string,
  timeZone: string,        // "Europe/Prague"
  currencyCode: string,    // "CZK"
  industryCategory?: string
}
Output: { propertyId, displayName, measurementId }
```

**ga4_get_property**
```typescript
// Get property details
Input: { propertyId: string } // "properties/123456789"
Output: { propertyId, displayName, timeZone, currencyCode, serviceLevel, createTime }
```

**ga4_update_property**
```typescript
// Update property settings
Input: {
  propertyId: string,
  displayName?: string,
  timeZone?: string,
  currencyCode?: string
}
Output: { propertyId, updated fields... }
```

**ga4_delete_property**
```typescript
// Soft-delete property (moves to trash)
Input: { propertyId: string }
Output: { success: boolean, message: string }
```

### Task 3.2: GA4 Data Streams Tools

**ga4_list_data_streams**
```typescript
// List all data streams for a property
Input: { propertyId: string }
Output: Array of { streamId, streamName, type, webStreamData/appStreamData }
```

**ga4_create_web_stream**
```typescript
// Create web data stream
Input: {
  propertyId: string,
  displayName: string,
  defaultUri: string,  // "https://example.com"
  enhancedMeasurement?: boolean
}
Output: { streamId, measurementId, streamName }
```

**ga4_create_app_stream**
```typescript
// Create mobile app stream
Input: {
  propertyId: string,
  displayName: string,
  packageName: string,  // iOS bundle ID or Android package
  platform: 'IOS' | 'ANDROID'
}
Output: { streamId, streamName, appId }
```

**ga4_update_data_stream**
```typescript
// Update stream settings
Input: {
  streamId: string,  // "properties/123/dataStreams/456"
  displayName?: string,
  enhancedMeasurement?: boolean
}
Output: { streamId, updated fields... }
```

**ga4_get_measurement_id**
```typescript
// Get measurement ID for web stream
Input: { streamId: string }
Output: { measurementId: string } // "G-XXXXXXXXXX"
```

### Task 3.3: GA4 Events & Conversions Tools

**ga4_list_custom_events**
```typescript
// List custom events defined in property
Input: { propertyId: string }
Output: Array of { eventName, createTime, customEvent }
```

**ga4_create_custom_event**
```typescript
// Create custom event definition
Input: {
  propertyId: string,
  eventName: string,  // must follow GA4 naming rules
  parameters?: Array<{ name: string, type: 'STRING' | 'NUMBER' }>
}
Output: { eventName, success: boolean }
```

**ga4_list_conversion_events**
```typescript
// List conversion events
Input: { propertyId: string }
Output: Array of { eventName, createTime, deletable, custom }
```

**ga4_create_conversion_event**
```typescript
// Mark event as conversion
Input: {
  propertyId: string,
  eventName: string
}
Output: { eventName, success: boolean }
```

**ga4_delete_conversion_event**
```typescript
// Remove conversion marking
Input: {
  propertyId: string,
  eventName: string
}
Output: { success: boolean }
```

### Task 3.4: GA4 Reporting Tools

**ga4_get_realtime**
```typescript
// Get real-time visitor data
Input: {
  propertyId: string,
  dimensions?: string[],  // ["country", "city", "deviceCategory"]
  metrics?: string[]      // ["activeUsers", "screenPageViews"]
}
Output: { totalUsers, byDimension: [...] }
```

**ga4_run_report**
```typescript
// Run custom report
Input: {
  propertyId: string,
  dateRanges: Array<{ startDate: string, endDate: string }>,
  dimensions: string[],   // ["date", "country", "pagePath"]
  metrics: string[],      // ["sessions", "totalUsers", "screenPageViews"]
  dimensionFilter?: object,
  metricFilter?: object,
  orderBys?: Array<{ dimension?: string, metric?: string, desc?: boolean }>,
  limit?: number
}
Output: { rows: [...], rowCount, metadata }
```

**ga4_run_pivot_report**
```typescript
// Run pivot table report
Input: {
  propertyId: string,
  dateRanges: Array<{ startDate: string, endDate: string }>,
  dimensions: string[],
  metrics: string[],
  pivots: Array<{
    fieldNames: string[],
    orderBys?: object[],
    offset?: number,
    limit?: number
  }>
}
Output: { pivotHeaders, rows, metadata }
```

**ga4_batch_run_reports**
```typescript
// Run multiple reports in single request
Input: {
  propertyId: string,
  requests: Array<{
    dateRanges: [...],
    dimensions: [...],
    metrics: [...]
  }>
}
Output: { reports: Array<{ rows, rowCount, metadata }> }
```

### Task 3.5: GA4 Custom Dimensions/Metrics Tools

**ga4_list_custom_dimensions**
```typescript
// List custom dimensions
Input: { propertyId: string }
Output: Array of { name, parameterName, displayName, scope, description }
```

**ga4_create_custom_dimension**
```typescript
// Create custom dimension
Input: {
  propertyId: string,
  parameterName: string,  // matches event parameter name
  displayName: string,
  scope: 'EVENT' | 'USER' | 'ITEM',
  description?: string
}
Output: { name, parameterName, displayName, scope }
```

**ga4_list_custom_metrics**
```typescript
// List custom metrics
Input: { propertyId: string }
Output: Array of { name, parameterName, displayName, scope, measurementUnit }
```

**ga4_create_custom_metric**
```typescript
// Create custom metric
Input: {
  propertyId: string,
  parameterName: string,
  displayName: string,
  scope: 'EVENT',
  measurementUnit: 'STANDARD' | 'CURRENCY' | 'FEET' | 'METERS' | 'KILOMETERS' | 'MILES' | 'MILLISECONDS' | 'SECONDS' | 'MINUTES' | 'HOURS',
  description?: string
}
Output: { name, parameterName, displayName, measurementUnit }
```

---

## Phase 4: Google Search Console Tools

### Tool Naming Convention
All Search Console tools prefixed with `gsc_`

### Task 4.1: Site Management Tools

**gsc_list_sites**
```typescript
// List all verified sites
Input: {} (no required params)
Output: Array of { siteUrl, permissionLevel }
```

**gsc_get_site**
```typescript
// Get site details
Input: { siteUrl: string } // "https://example.com/" or "sc-domain:example.com"
Output: { siteUrl, permissionLevel }
```

### Task 4.2: Search Analytics Tools

**gsc_search_analytics**
```typescript
// Get search performance data
Input: {
  siteUrl: string,
  startDate: string,      // "2024-01-01"
  endDate: string,        // "2024-01-31"
  dimensions?: string[],  // ["query", "page", "country", "device", "searchAppearance"]
  dimensionFilterGroups?: Array<{
    groupType: 'AND' | 'OR',
    filters: Array<{
      dimension: string,
      operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'NOT_CONTAINS',
      expression: string
    }>
  }>,
  aggregationType?: 'AUTO' | 'BY_PAGE' | 'BY_PROPERTY',
  rowLimit?: number,      // max 25000
  startRow?: number
}
Output: {
  rows: Array<{
    keys: string[],       // dimension values
    clicks: number,
    impressions: number,
    ctr: number,
    position: number
  }>,
  responseAggregationType: string
}
```

### Task 4.3: Sitemap Tools

**gsc_list_sitemaps**
```typescript
// List submitted sitemaps
Input: { siteUrl: string }
Output: Array of {
  path: string,
  lastSubmitted: string,
  isPending: boolean,
  isSitemapsIndex: boolean,
  lastDownloaded: string,
  warnings: number,
  errors: number
}
```

**gsc_submit_sitemap**
```typescript
// Submit new sitemap
Input: {
  siteUrl: string,
  feedpath: string  // "https://example.com/sitemap.xml"
}
Output: { success: boolean, message: string }
```

**gsc_delete_sitemap**
```typescript
// Delete sitemap
Input: {
  siteUrl: string,
  feedpath: string
}
Output: { success: boolean, message: string }
```

---

## Phase 5: Google Ads Tools

### Tool Naming Convention
All Google Ads tools prefixed with `ads_`

### Important Notes
- Requires Developer Token (GOOGLE_ADS_DEVELOPER_TOKEN)
- Uses GAQL (Google Ads Query Language)
- Customer IDs without dashes: "1234567890"
- Cost values in micros (divide by 1,000,000)

### Task 5.1: Account Management Tools

**ads_list_accounts**
```typescript
// List accessible customer accounts
Input: {
  managerId?: string  // MCC account ID for listing sub-accounts
}
Output: Array of {
  customerId: string,
  descriptiveName: string,
  currencyCode: string,
  timeZone: string,
  manager: boolean
}
```

**ads_get_account**
```typescript
// Get account details
Input: { customerId: string }
Output: {
  customerId: string,
  descriptiveName: string,
  currencyCode: string,
  timeZone: string,
  trackingUrlTemplate: string,
  autoTaggingEnabled: boolean
}
```

### Task 5.2: Campaign Tools

**ads_get_campaigns**
```typescript
// List campaigns with status
Input: {
  customerId: string,
  status?: 'ENABLED' | 'PAUSED' | 'REMOVED'
}
Output: Array of {
  id: string,
  name: string,
  status: string,
  advertisingChannelType: string,
  biddingStrategy: string,
  budget: {
    amountMicros: number,
    deliveryMethod: string
  },
  startDate: string,
  endDate: string
}
```

**ads_campaign_performance**
```typescript
// Get campaign performance metrics
Input: {
  customerId: string,
  campaignId?: string,  // optional, all campaigns if not specified
  dateRange: {
    startDate: string,  // "2024-01-01"
    endDate: string     // "2024-01-31"
  },
  metrics?: string[]    // default: clicks, impressions, cost, conversions, ctr, averageCpc
}
Output: Array of {
  campaignId: string,
  campaignName: string,
  clicks: number,
  impressions: number,
  costMicros: number,
  cost: number,  // converted from micros
  conversions: number,
  ctr: number,
  averageCpc: number,
  averageCpm: number
}
```

### Task 5.3: Keyword Tools

**ads_get_keywords**
```typescript
// List keywords with performance
Input: {
  customerId: string,
  campaignId?: string,
  adGroupId?: string,
  status?: 'ENABLED' | 'PAUSED' | 'REMOVED'
}
Output: Array of {
  criterionId: string,
  keyword: string,
  matchType: string,
  status: string,
  adGroupId: string,
  adGroupName: string,
  campaignId: string,
  campaignName: string,
  qualityScore: number,
  cpcBidMicros: number
}
```

**ads_keyword_performance**
```typescript
// Get keyword performance metrics
Input: {
  customerId: string,
  dateRange: {
    startDate: string,
    endDate: string
  },
  campaignId?: string,
  adGroupId?: string
}
Output: Array of {
  keyword: string,
  matchType: string,
  clicks: number,
  impressions: number,
  costMicros: number,
  cost: number,
  conversions: number,
  ctr: number,
  averageCpc: number,
  averagePosition: number
}
```

---

## Phase 6: MCP Server Integration

### Task 6.1: Entry Point (src/index.ts)

```typescript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { validateAuth } from './utils/google-auth.js';
import { allTools, toolHandlers } from './tools/index.js';

// Load environment in development
if (process.env.NODE_ENV !== 'production') {
  const { config } = await import('dotenv');
  config();
}

// Validate authentication
validateAuth();

// Initialize MCP Server
const server = new Server(
  {
    name: 'mcp-google-marketing',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allTools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const handler = toolHandlers.get(name);
  if (!handler) {
    return {
      content: [{ type: 'text', text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  try {
    return await handler(args);
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Google Marketing server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
```

### Task 6.2: Central Tool Registration (src/tools/index.ts)

```typescript
import { Tool } from '@modelcontextprotocol/sdk/types.js';

// Import all tools
import * as analyticsTools from './analytics/index.js';
import * as searchConsoleTools from './search-console/index.js';
import * as adsTools from './ads/index.js';

// Combine all tools
export const allTools: Tool[] = [
  ...Object.values(analyticsTools.tools),
  ...Object.values(searchConsoleTools.tools),
  ...Object.values(adsTools.tools),
];

// Create handler map
export const toolHandlers = new Map<string, (args: any) => Promise<any>>([
  ...Object.entries(analyticsTools.handlers),
  ...Object.entries(searchConsoleTools.handlers),
  ...Object.entries(adsTools.handlers),
]);
```

---

## Phase 7: Testing & Documentation

### Task 7.1: Testing Configuration

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
```

### Task 7.2: Documentation Structure

**README.md sections:**
1. Project description
2. Features
3. Requirements
4. Quick Start
5. Configuration
   - Environment variables
   - Service account setup
   - Google Ads developer token
6. Client Integration
   - Claude Code
   - Claude Desktop
   - Cursor
7. Tool Reference
   - Google Analytics 4
   - Google Search Console
   - Google Ads
8. Examples
9. Troubleshooting
10. Contributing

---

## Environment Configuration

**.env.example:**
```bash
# Google Service Account Authentication (choose one method)
# Method 1: Path to service account JSON file
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Method 2: Full JSON as string
# GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# Method 3: Individual values
# GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
# GOOGLE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\n...'

# Optional: Project ID
GOOGLE_PROJECT_ID=your-project-id

# Google Ads Configuration (required for ads_ tools)
GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token
GOOGLE_ADS_LOGIN_CUSTOMER_ID=1234567890  # MCC account ID

# Default IDs (optional, tools accept these as parameters)
DEFAULT_GA4_PROPERTY_ID=properties/123456789
DEFAULT_GSC_SITE_URL=https://example.com/
DEFAULT_ADS_CUSTOMER_ID=1234567890

# Testing
TEST_GA4_PROPERTY_ID=properties/123456789
TEST_GSC_SITE_URL=https://example.com/
TEST_ADS_CUSTOMER_ID=1234567890
```

---

## Execution Order

1. **Project Scaffolding** - Create directory structure, package.json, configs
2. **Authentication** - Implement multi-service auth system
3. **GA4 Tools** - Start with list_accounts, progress through management, then reporting
4. **Search Console Tools** - Simpler API, faster to implement
5. **Google Ads Tools** - Most complex due to GAQL
6. **MCP Integration** - Entry point and tool registration
7. **Testing** - Unit tests for utils, integration tests for tools
8. **Documentation** - README, setup guides, tool reference

---

## Success Criteria

- [ ] All three Google services authenticate successfully
- [ ] All Phase 1 tools implemented and working
- [ ] Error handling provides helpful messages
- [ ] Works with Claude Code via stdio
- [ ] Documentation complete for public use
- [ ] Tests pass with 80%+ coverage
- [ ] Build produces working distribution
