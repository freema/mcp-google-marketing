# MCP Google Marketing

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Server](https://img.shields.io/badge/MCP-Server-purple.svg)](https://modelcontextprotocol.io/)

A Model Context Protocol (MCP) server that provides unified access to **Google Analytics 4**, **Google Search Console**, and **Google AdSense** APIs. Designed to work with Claude Desktop, Claude Code, and other MCP-compatible clients.

## Features

- **Google Analytics 4 (GA4)** - 22 tools for property management, data streams, conversions, reporting, and custom dimensions/metrics
- **Google Search Console** - 6 tools for site management, search analytics, and sitemaps
- **Google AdSense** - 6 tools for account management, ad units, payments, and revenue reports
- **OAuth 2.0** - Secure browser-based authentication with automatic token refresh

---

## Quick Start for Claude Code

### 1. Set up OAuth credentials

First, create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/):
1. Create a new project or select existing one
2. Enable APIs: **Google Analytics Admin API**, **Google Analytics Data API**, **Google Search Console API**, **AdSense Management API**
3. Create **OAuth client ID** (Desktop app type)
4. Copy your **Client ID** and **Client Secret**

### 2. Authenticate (one-time setup)

```bash
# Set your credentials
export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your-client-secret"

# Run authentication (opens browser)
npx mcp-google-marketing auth
```

### 3. Add to Claude Code

```bash
claude mcp add google-marketing npx mcp-google-marketing \
  --env GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com \
  --env GOOGLE_CLIENT_SECRET=your-client-secret
```

That's it! The server is now available in Claude Code.

---

## Prerequisites

- **Node.js 20+** - Required runtime
- **Google Cloud Project** - With enabled APIs
- **OAuth 2.0 Credentials** - Desktop app type

## Installation

### Via npx (Recommended)

No installation required:

```bash
npx mcp-google-marketing auth    # Authenticate first
npx mcp-google-marketing         # Start server
```

### Via npm (Global)

```bash
npm install -g mcp-google-marketing
mcp-google-marketing auth        # Authenticate first
mcp-google-marketing             # Start server
```

### From Source (Development)

```bash
git clone https://github.com/freema/mcp-google-marketing.git
cd mcp-google-marketing
npm install
npm run build
```

---

## CLI Commands

```bash
# Authenticate with Google (opens browser)
npx mcp-google-marketing auth

# Check authentication status
npx mcp-google-marketing auth --status

# Remove stored tokens (logout)
npx mcp-google-marketing auth --logout

# Start MCP server (for Claude Code/Desktop)
npx mcp-google-marketing

# Show help
npx mcp-google-marketing --help
```

---

## Configuration

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Google Analytics Admin API**
   - **Google Analytics Data API**
   - **Google Search Console API**
   - **AdSense Management API**

### Step 2: Create OAuth 2.0 Credentials

1. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
2. Select **Desktop app** as the application type
3. Name it (e.g., "MCP Google Marketing")
4. Copy your **Client ID** and **Client Secret**

### Step 3: Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Choose **External** user type
3. Fill in required fields (app name, support email)
4. Add scopes:
   - `https://www.googleapis.com/auth/analytics.edit`
   - `https://www.googleapis.com/auth/analytics.readonly`
   - `https://www.googleapis.com/auth/webmasters`
   - `https://www.googleapis.com/auth/adsense.readonly`
5. Add your email to **Test users** (or publish the app)

### Step 4: Set Environment Variables

```bash
export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your-client-secret"
```

Or create a `.env` file:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Step 5: Authenticate

Run the authentication command to complete OAuth setup:

```bash
npx mcp-google-marketing auth
```

This will:
1. Open your browser for Google OAuth authorization
2. Ask you to sign in and grant permissions
3. Save tokens to `.credentials/tokens.json`

---

## Usage

### Claude Code

```bash
# 1. Authenticate first (if not done already)
npx mcp-google-marketing auth

# 2. Add the MCP server
claude mcp add google-marketing npx mcp-google-marketing \
  --env GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com \
  --env GOOGLE_CLIENT_SECRET=your-client-secret
```

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "google-marketing": {
      "command": "npx",
      "args": ["-y", "mcp-google-marketing"],
      "env": {
        "GOOGLE_CLIENT_ID": "your-client-id.apps.googleusercontent.com",
        "GOOGLE_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

**Important:** Run `npx mcp-google-marketing auth` in your terminal first to authenticate before using with Claude Desktop.

---

## Available Tools

### Utility (1 tool)

| Tool | Description |
|------|-------------|
| `auth_status` | Check OAuth authentication status |

### Google Analytics 4 (22 tools)

#### Account & Property Management
| Tool | Description |
|------|-------------|
| `ga4_list_accounts` | List all GA4 accounts |
| `ga4_list_properties` | List properties for an account |
| `ga4_create_property` | Create a new GA4 property |
| `ga4_get_property` | Get property details |
| `ga4_update_property` | Update property settings |
| `ga4_delete_property` | Delete a property |

#### Data Streams
| Tool | Description |
|------|-------------|
| `ga4_list_data_streams` | List data streams for a property |
| `ga4_create_web_stream` | Create a web data stream |
| `ga4_create_app_stream` | Create an app data stream |
| `ga4_update_data_stream` | Update data stream settings |
| `ga4_get_measurement_id` | Get measurement ID for a stream |

#### Conversion Events
| Tool | Description |
|------|-------------|
| `ga4_list_conversion_events` | List conversion events |
| `ga4_create_conversion_event` | Create a conversion event |
| `ga4_delete_conversion_event` | Delete a conversion event |

#### Reporting
| Tool | Description |
|------|-------------|
| `ga4_get_realtime` | Get real-time visitor data |
| `ga4_run_report` | Run a custom report |
| `ga4_run_pivot_report` | Run a pivot table report |
| `ga4_batch_run_reports` | Run multiple reports at once |

#### Custom Dimensions & Metrics
| Tool | Description |
|------|-------------|
| `ga4_list_custom_dimensions` | List custom dimensions |
| `ga4_create_custom_dimension` | Create a custom dimension |
| `ga4_list_custom_metrics` | List custom metrics |
| `ga4_create_custom_metric` | Create a custom metric |

### Google Search Console (6 tools)

| Tool | Description |
|------|-------------|
| `gsc_list_sites` | List all verified sites |
| `gsc_get_site` | Get site details |
| `gsc_search_analytics` | Query search performance data |
| `gsc_list_sitemaps` | List submitted sitemaps |
| `gsc_submit_sitemap` | Submit a new sitemap |
| `gsc_delete_sitemap` | Delete a sitemap |

### Google AdSense (6 tools)

| Tool | Description |
|------|-------------|
| `adsense_list_accounts` | List all AdSense accounts |
| `adsense_get_account` | Get account details |
| `adsense_list_ad_clients` | List ad clients |
| `adsense_list_ad_units` | List ad units |
| `adsense_list_payments` | List payments history |
| `adsense_generate_report` | Generate earnings report |

---

## Examples

### GA4: Run a Report

```json
{
  "tool": "ga4_run_report",
  "arguments": {
    "propertyId": "properties/123456789",
    "dateRanges": [{"startDate": "30daysAgo", "endDate": "today"}],
    "dimensions": ["date", "country"],
    "metrics": ["sessions", "totalUsers", "screenPageViews"]
  }
}
```

### Search Console: Query Analytics

```json
{
  "tool": "gsc_search_analytics",
  "arguments": {
    "siteUrl": "https://example.com",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "dimensions": ["query", "page"],
    "rowLimit": 100
  }
}
```

### AdSense: Generate Report

```json
{
  "tool": "adsense_generate_report",
  "arguments": {
    "accountId": "accounts/pub-1234567890123456",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "metrics": ["ESTIMATED_EARNINGS", "PAGE_VIEWS", "CLICKS"],
    "dimensions": ["DATE"]
  }
}
```

---

## Development

### Commands

```bash
# Install dependencies
npm install

# Development with hot-reload
npm run dev

# Build for production
npm run build

# Run type checking
npm run typecheck

# Run linter
npm run lint

# Run tests
npm test

# Run all checks (typecheck + lint + test + build)
npm run check:all
```

### MCP Inspector

Debug and test your tools:

```bash
# First authenticate
npm run build
node -r dotenv/config dist/index.js auth

# Then run inspector
npm run inspector
```

### Project Structure

```
src/
├── index.ts              # Server entry point + CLI
├── config/
│   └── constants.ts      # Configuration constants
├── tools/
│   ├── analytics/        # GA4 tools (22 tools)
│   ├── search-console/   # Search Console tools (6 tools)
│   └── adsense/          # AdSense tools (6 tools)
├── types/
│   ├── analytics.ts      # GA4 schemas
│   ├── search-console.ts # Search Console schemas
│   ├── adsense.ts        # AdSense schemas
│   └── common.ts         # Shared types
└── utils/
    ├── google-auth.ts    # OAuth authentication
    ├── oauth-flow.ts     # OAuth browser flow
    ├── token-storage.ts  # Token persistence
    └── error-messages.ts # Error formatting
```

---

## Troubleshooting

### "Authentication required" error in Claude Code

You need to authenticate before using the server:

```bash
npx mcp-google-marketing auth
```

Then restart Claude Code to reconnect the MCP server.

### "Access blocked: app has not completed Google verification"

Your OAuth app is in testing mode:
1. Go to **OAuth consent screen** → click **PUBLISH APP**
2. Or add your email to **Test users**

### "No refresh token received"

Revoke app access and re-authorize:
1. Go to [Google Account Permissions](https://myaccount.google.com/permissions)
2. Find and remove the app
3. Delete tokens: `npx mcp-google-marketing auth --logout`
4. Re-authenticate: `npx mcp-google-marketing auth`

### Port 8085 already in use

The OAuth callback server uses port 8085:
1. Stop other services using that port: `lsof -i :8085`
2. Or modify `OAUTH_CONFIG.port` in `src/config/constants.ts`

### Check authentication status

```bash
npx mcp-google-marketing auth --status
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT - see [LICENSE](LICENSE) for details.

---

## Links

- [GitHub Repository](https://github.com/freema/mcp-google-marketing)
- [npm Package](https://www.npmjs.com/package/mcp-google-marketing)
- [Changelog](CHANGELOG.md)
- [Model Context Protocol](https://modelcontextprotocol.io/)
