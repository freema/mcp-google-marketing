import { google } from 'googleapis';
import { AnalyticsAdminServiceClient } from '@google-analytics/admin';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { ALL_SCOPES } from '../config/constants.js';
import { loadTokens, hasValidTokens, StoredTokens } from './token-storage.js';

// Cached clients
let analyticsAdminClient: AnalyticsAdminServiceClient | null = null;
let analyticsDataClient: BetaAnalyticsDataClient | null = null;
let searchConsoleClient: ReturnType<typeof google.searchconsole> | null = null;
let adsenseClient: ReturnType<typeof google.adsense> | null = null;

// Cached OAuth2 client
let oauth2Client: InstanceType<typeof google.auth.OAuth2> | null = null;

/**
 * Creates and returns an OAuth2 client with stored tokens
 */
async function getOAuth2Client(): Promise<InstanceType<typeof google.auth.OAuth2>> {
  if (oauth2Client) {
    return oauth2Client;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing OAuth credentials. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
    );
  }

  const tokens = await loadTokens();
  if (!tokens) {
    throw new Error('No OAuth tokens found. Please run the server to complete OAuth setup.');
  }

  oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_type: tokens.token_type,
    expiry_date: tokens.expiry_date,
  });

  // Set up automatic token refresh
  oauth2Client.on('tokens', async (newTokens) => {
    const { saveTokens } = await import('./token-storage.js');
    const currentTokens = await loadTokens();

    const updatedTokens: StoredTokens = {
      access_token: newTokens.access_token || currentTokens?.access_token || '',
      refresh_token: newTokens.refresh_token || currentTokens?.refresh_token || '',
      token_type: newTokens.token_type || 'Bearer',
      expiry_date: newTokens.expiry_date || Date.now() + 3600 * 1000,
      scope: newTokens.scope || currentTokens?.scope || ALL_SCOPES.join(' '),
    };

    await saveTokens(updatedTokens);
  });

  return oauth2Client;
}

/**
 * Validates that OAuth credentials are configured
 */
export function validateAuth(): void {
  const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
  const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;

  if (!hasClientId || !hasClientSecret) {
    throw new Error(
      'Missing OAuth credentials. Please set the following environment variables:\n' +
        '- GOOGLE_CLIENT_ID: Your OAuth 2.0 Client ID\n' +
        '- GOOGLE_CLIENT_SECRET: Your OAuth 2.0 Client Secret\n\n' +
        'You can create these at: https://console.cloud.google.com/apis/credentials'
    );
  }
}

/**
 * Checks if OAuth setup is complete (tokens exist)
 */
export async function isAuthComplete(): Promise<boolean> {
  return await hasValidTokens();
}

/**
 * Gets the GA4 Admin API client for management operations
 */
export async function getAnalyticsAdminClient(): Promise<AnalyticsAdminServiceClient> {
  if (analyticsAdminClient) {
    return analyticsAdminClient;
  }

  const auth = await getOAuth2Client();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  analyticsAdminClient = new AnalyticsAdminServiceClient({
    authClient: auth as any,
  });

  return analyticsAdminClient;
}

/**
 * Gets the GA4 Data API client for reporting operations
 */
export async function getAnalyticsDataClient(): Promise<BetaAnalyticsDataClient> {
  if (analyticsDataClient) {
    return analyticsDataClient;
  }

  const auth = await getOAuth2Client();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  analyticsDataClient = new BetaAnalyticsDataClient({
    authClient: auth as any,
  });

  return analyticsDataClient;
}

/**
 * Gets the Search Console API client
 */
export async function getSearchConsoleClient() {
  if (searchConsoleClient) {
    return searchConsoleClient;
  }

  const auth = await getOAuth2Client();

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

  const auth = await getOAuth2Client();

  adsenseClient = google.adsense({
    version: 'v2',
    auth,
  });

  return adsenseClient;
}

/**
 * Resets all cached clients (useful for testing or re-authentication)
 */
export function resetClients(): void {
  analyticsAdminClient = null;
  analyticsDataClient = null;
  searchConsoleClient = null;
  adsenseClient = null;
  oauth2Client = null;
}
