import { google } from 'googleapis';
import { AnalyticsAdminServiceClient } from '@google-analytics/admin';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { ALL_SCOPES } from '../config/constants.js';

// Cached clients
let analyticsAdminClient: AnalyticsAdminServiceClient | null = null;
let analyticsDataClient: BetaAnalyticsDataClient | null = null;
let searchConsoleClient: ReturnType<typeof google.searchconsole> | null = null;
let adsenseClient: ReturnType<typeof google.adsense> | null = null;

interface ServiceAccountCredentials {
  type: string;
  project_id?: string;
  private_key: string;
  client_email: string;
}

/**
 * Gets service account credentials from environment
 */
function getCredentials(): ServiceAccountCredentials {
  // Priority 1: File-based authentication
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  }

  // Priority 2: JSON string authentication
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  }

  // Priority 3: Private key + email authentication
  if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL) {
    const result: ServiceAccountCredentials = {
      type: 'service_account',
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
    };
    if (process.env.GOOGLE_PROJECT_ID) {
      result.project_id = process.env.GOOGLE_PROJECT_ID;
    }
    return result;
  }

  throw new Error('No valid credentials found');
}

/**
 * Validates that at least one authentication method is configured
 */
export function validateAuth(): void {
  const hasFileAuth = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const hasJsonAuth = !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const hasPrivateKeyAuth = !!process.env.GOOGLE_PRIVATE_KEY && !!process.env.GOOGLE_CLIENT_EMAIL;

  if (!hasFileAuth && !hasJsonAuth && !hasPrivateKeyAuth) {
    throw new Error(
      'No authentication method provided. Please set one of:\n' +
        '- GOOGLE_APPLICATION_CREDENTIALS to the path of your service account key file\n' +
        '- GOOGLE_SERVICE_ACCOUNT_KEY to the JSON string of your service account credentials\n' +
        '- GOOGLE_PRIVATE_KEY and GOOGLE_CLIENT_EMAIL for direct private key authentication'
    );
  }

  // Validate private key authentication
  if (!hasFileAuth && !hasJsonAuth && hasPrivateKeyAuth) {
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('GOOGLE_PRIVATE_KEY is required when using private key authentication');
    }
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
      throw new Error('GOOGLE_CLIENT_EMAIL is required when using private key authentication');
    }

    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
      throw new Error(
        'GOOGLE_PRIVATE_KEY appears to be invalid. ' +
          'It should start with -----BEGIN PRIVATE KEY----- and end with -----END PRIVATE KEY-----'
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(process.env.GOOGLE_CLIENT_EMAIL)) {
      throw new Error(
        'GOOGLE_CLIENT_EMAIL appears to be invalid. ' +
          'It should be a valid email address (e.g., your-service-account@your-project.iam.gserviceaccount.com)'
      );
    }
  }

  // Validate JSON authentication
  if (!hasFileAuth && hasJsonAuth) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!);

      if (!credentials.type || credentials.type !== 'service_account') {
        throw new Error('Invalid service account: type must be "service_account"');
      }
      if (!credentials.private_key) {
        throw new Error('Invalid service account: missing private_key');
      }
      if (!credentials.client_email) {
        throw new Error('Invalid service account: missing client_email');
      }

      if (!process.env.GOOGLE_PROJECT_ID && credentials.project_id) {
        process.env.GOOGLE_PROJECT_ID = credentials.project_id;
      }
    } catch (error: unknown) {
      if (error instanceof SyntaxError) {
        throw new Error(
          'GOOGLE_SERVICE_ACCOUNT_KEY contains invalid JSON. ' +
            'Please ensure it is a valid JSON string.'
        );
      }
      throw error;
    }
  }
}

/**
 * Gets the GA4 Admin API client for management operations
 */
export async function getAnalyticsAdminClient(): Promise<AnalyticsAdminServiceClient> {
  if (analyticsAdminClient) {
    return analyticsAdminClient;
  }

  const credentials = getCredentials();

  const options: {
    credentials: { client_email: string; private_key: string };
    projectId?: string;
  } = {
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  };

  const projectId = credentials.project_id ?? process.env.GOOGLE_PROJECT_ID;
  if (projectId) {
    options.projectId = projectId;
  }

  analyticsAdminClient = new AnalyticsAdminServiceClient(options);

  return analyticsAdminClient;
}

/**
 * Gets the GA4 Data API client for reporting operations
 */
export async function getAnalyticsDataClient(): Promise<BetaAnalyticsDataClient> {
  if (analyticsDataClient) {
    return analyticsDataClient;
  }

  const credentials = getCredentials();

  const options: {
    credentials: { client_email: string; private_key: string };
    projectId?: string;
  } = {
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  };

  const projectId = credentials.project_id ?? process.env.GOOGLE_PROJECT_ID;
  if (projectId) {
    options.projectId = projectId;
  }

  analyticsDataClient = new BetaAnalyticsDataClient(options);

  return analyticsDataClient;
}

/**
 * Gets the Search Console API client
 */
export async function getSearchConsoleClient() {
  if (searchConsoleClient) {
    return searchConsoleClient;
  }

  const credentials = getCredentials();

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ALL_SCOPES,
  });

  searchConsoleClient = google.searchconsole({
    version: 'v1',
    auth,
  });

  return searchConsoleClient;
}

/**
 * Gets the AdSense API client
 */
export async function getAdsenseClient() {
  if (adsenseClient) {
    return adsenseClient;
  }

  const credentials = getCredentials();

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/adsense.readonly'],
  });

  adsenseClient = google.adsense({
    version: 'v2',
    auth,
  });

  return adsenseClient;
}

/**
 * Resets all cached clients (useful for testing)
 */
export function resetClients(): void {
  analyticsAdminClient = null;
  analyticsDataClient = null;
  searchConsoleClient = null;
  adsenseClient = null;
}
