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
  if (message.includes('Permission denied') || message.includes('Access denied') || message.includes('403')) {
    if (context.includes('adsense')) {
      return `Permission denied for AdSense API.

ACTION REQUIRED:
1. Go to your AdSense account: https://www.google.com/adsense
2. Navigate to: Account → Access and authorization → Manage users
3. Add your service account email with appropriate permissions
4. Service account email is in your .env file as GOOGLE_CLIENT_EMAIL`;
    }

    if (context.includes('analytics') || context.includes('ga4')) {
      return `Permission denied for Google Analytics.

ACTION REQUIRED:
1. Go to Google Analytics: https://analytics.google.com
2. Navigate to: Admin → Property Access Management
3. Add your service account email with Editor or Viewer role
4. Service account email is in your .env file as GOOGLE_CLIENT_EMAIL`;
    }

    if (context.includes('searchconsole') || context.includes('gsc')) {
      return `Permission denied for Search Console.

ACTION REQUIRED:
1. Go to Search Console: https://search.google.com/search-console
2. Navigate to: Settings → Users and permissions
3. Add your service account email with Full or Restricted access
4. Service account email is in your .env file as GOOGLE_CLIENT_EMAIL`;
    }

    return `Permission denied. Please ensure your service account has the required permissions.

Original error: ${message}`;
  }

  // Invalid credentials
  if (message.includes('invalid_grant') || message.includes('Invalid credentials')) {
    return `Invalid credentials. Your service account credentials may be incorrect or expired.

ACTION REQUIRED:
1. Check your .env file for correct GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY
2. If needed, create a new key in Google Cloud Console:
   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
   - Select your service account
   - Keys → Add Key → Create new key → JSON
3. Update your .env file with the new credentials`;
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
- Your service account has access to this resource

Original error: ${message}`;
  }

  // Default: return original message with context
  return `${context}: ${message}`;
}
