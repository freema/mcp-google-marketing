/**
 * Parses Google API errors and returns user-friendly messages with actionable instructions
 */
export function formatGoogleApiError(error: unknown, context: string): string {
  const message = error instanceof Error ? error.message : String(error);

  // API not enabled
  if (message.includes('has not been used in project') || message.includes('it is disabled')) {
    const apiMatch = message.match(/visiting (https:\/\/console\.developers\.google\.com[^\s]+)/);
    const enableUrl = apiMatch ? apiMatch[1] : null;

    if (message.includes('adsense.googleapis.com')) {
      return `AdSense Management API is not enabled for your Google Cloud project.

ACTION REQUIRED:
1. Go to Google Cloud Console: https://console.cloud.google.com/apis/library/adsense.googleapis.com
2. Select your project
3. Click "Enable" button
4. Wait a few seconds and try again`;
    }

    if (message.includes('analyticsadmin.googleapis.com')) {
      return `Google Analytics Admin API is not enabled for your Google Cloud project.

ACTION REQUIRED:
1. Go to Google Cloud Console: https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com
2. Select your project
3. Click "Enable" button
4. Wait a few seconds and try again`;
    }

    if (message.includes('analyticsdata.googleapis.com')) {
      return `Google Analytics Data API is not enabled for your Google Cloud project.

ACTION REQUIRED:
1. Go to Google Cloud Console: https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com
2. Select your project
3. Click "Enable" button
4. Wait a few seconds and try again`;
    }

    if (message.includes('searchconsole.googleapis.com')) {
      return `Google Search Console API is not enabled for your Google Cloud project.

ACTION REQUIRED:
1. Go to Google Cloud Console: https://console.cloud.google.com/apis/library/searchconsole.googleapis.com
2. Select your project
3. Click "Enable" button
4. Wait a few seconds and try again`;
    }

    // Generic API not enabled
    return `A required Google API is not enabled for your project.

ACTION REQUIRED:
1. Visit: ${enableUrl || 'Google Cloud Console APIs & Services'}
2. Enable the required API
3. Wait a few seconds and try again

Original error: ${message}`;
  }

  // Permission denied / Access denied
  if (
    message.includes('Permission denied') ||
    message.includes('Access denied') ||
    message.includes('403')
  ) {
    if (context.includes('adsense')) {
      return `Permission denied for AdSense API.

ACTION REQUIRED:
1. Ensure you're signed in with a Google account that has access to AdSense
2. Go to your AdSense account: https://www.google.com/adsense
3. Verify your account is active and in good standing
4. Try re-authorizing: delete ~/.config/mcp-google-marketing/tokens.json and restart`;
    }

    if (context.includes('analytics') || context.includes('ga4')) {
      return `Permission denied for Google Analytics.

ACTION REQUIRED:
1. Ensure you're signed in with a Google account that has access to this GA4 property
2. Go to Google Analytics: https://analytics.google.com
3. Verify you have at least Viewer access to the property
4. Try re-authorizing: delete ~/.config/mcp-google-marketing/tokens.json and restart`;
    }

    if (context.includes('searchconsole') || context.includes('gsc')) {
      return `Permission denied for Search Console.

ACTION REQUIRED:
1. Ensure you're signed in with a Google account that has access to this site
2. Go to Search Console: https://search.google.com/search-console
3. Verify you have Owner or Full User access
4. Try re-authorizing: delete ~/.config/mcp-google-marketing/tokens.json and restart`;
    }

    return `Permission denied. Please ensure you have the required permissions.

Original error: ${message}`;
  }

  // Invalid credentials / Token expired
  if (
    message.includes('invalid_grant') ||
    message.includes('Invalid credentials') ||
    message.includes('Token has been expired')
  ) {
    return `Invalid or expired credentials.

ACTION REQUIRED:
1. Delete stored tokens: rm -rf ~/.config/mcp-google-marketing/tokens.json
2. Restart the server to trigger new OAuth authorization
3. Sign in again with your Google account`;
  }

  // Quota exceeded
  if (message.includes('Quota exceeded') || message.includes('rateLimitExceeded')) {
    return `API quota exceeded. You've hit the rate limit for this API.

ACTION REQUIRED:
1. Wait a few minutes before retrying
2. If this persists, check your quota in Google Cloud Console:
   https://console.cloud.google.com/apis/dashboard`;
  }

  // Resource not found
  if (message.includes('not found') || message.includes('404')) {
    return `Resource not found. The requested resource does not exist or you don't have access to it.

Please verify:
- The ID/URL you provided is correct
- You have access to this resource with your Google account

Original error: ${message}`;
  }

  // Default: return original message with context
  return `${context}: ${message}`;
}
