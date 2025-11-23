import { google } from 'googleapis';
import * as http from 'http';
import open from 'open';
import { URL } from 'url';
import { saveTokens, StoredTokens } from './token-storage.js';
import { ALL_SCOPES, OAUTH_CONFIG } from '../config/constants.js';

/**
 * Performs the OAuth 2.0 authorization flow
 * Opens browser for user consent and captures the authorization code
 */
export async function performOAuthFlow(): Promise<StoredTokens> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing OAuth credentials. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, OAUTH_CONFIG.redirectUri);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ALL_SCOPES,
    prompt: 'consent', // Force consent to always get refresh token
  });

  console.error('\n========================================');
  console.error('Google OAuth Authorization Required');
  console.error('========================================\n');
  console.error('Opening browser for authentication...');
  console.error('If the browser does not open, please visit:\n');
  console.error(authUrl);
  console.error('\n');

  // Get authorization code via local server
  const code = await startCallbackServer();

  // Exchange code for tokens
  console.error('Exchanging authorization code for tokens...');
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token) {
    throw new Error(
      'No refresh token received. Please revoke app access at https://myaccount.google.com/permissions and try again.'
    );
  }

  const storedTokens: StoredTokens = {
    access_token: tokens.access_token || '',
    refresh_token: tokens.refresh_token,
    token_type: tokens.token_type || 'Bearer',
    expiry_date: tokens.expiry_date || Date.now() + 3600 * 1000,
    scope: tokens.scope || ALL_SCOPES.join(' '),
  };

  // Save tokens
  await saveTokens(storedTokens);
  console.error('Tokens saved successfully!\n');

  // Open browser
  await open(authUrl);

  return storedTokens;
}

/**
 * Starts a local HTTP server to receive the OAuth callback
 */
function startCallbackServer(): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '', `http://localhost:${OAUTH_CONFIG.port}`);

      if (url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #d32f2f;">Authorization Failed</h1>
                <p>Error: ${error}</p>
                <p>You can close this window.</p>
              </body>
            </html>
          `);
          server.close();
          reject(new Error(`OAuth error: ${error}`));
          return;
        }

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #4caf50;">Authorization Successful!</h1>
                <p>You can close this window and return to the terminal.</p>
                <script>setTimeout(() => window.close(), 3000);</script>
              </body>
            </html>
          `);
          server.close();
          resolve(code);
          return;
        }
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    });

    server.listen(OAUTH_CONFIG.port, () => {
      console.error(`Callback server listening on port ${OAUTH_CONFIG.port}...`);
    });

    // Timeout after 5 minutes
    setTimeout(
      () => {
        server.close();
        reject(new Error('OAuth timeout: No response received within 5 minutes'));
      },
      5 * 60 * 1000
    );

    server.on('error', (err) => {
      reject(new Error(`Failed to start callback server: ${err.message}`));
    });
  });
}
