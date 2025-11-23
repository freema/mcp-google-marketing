# MCP Google Marketing Server

A Model Context Protocol (MCP) server that provides unified access to Google Analytics 4, Google Search Console, and Google AdSense APIs. Designed to work with Claude Code and other MCP-compatible clients.

## Features

- **Google Analytics 4 (GA4)** - 22 tools for property management, data streams, conversions, reporting, and custom dimensions/metrics
- **Google Search Console** - 6 tools for site management, search analytics, and sitemaps
- **Google AdSense** - 6 tools for account management, ad units, payments, and revenue reports

## Installation

```bash
npm install
npm run build
```

## Configuration

1. Create a service account in [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Enable required APIs:
   - Google Analytics Admin API
   - Google Analytics Data API
   - Google Search Console API
   - AdSense Management API
3. Download the JSON key
4. Copy `.env.example` to `.env` and fill in:

```bash
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

5. Add the service account email to your GA4 property (Admin → Property Access Management)
6. Add the service account email to Search Console (Settings → Users and permissions)
7. Add the service account email to AdSense (Account → Access and authorization → Manage users)

## Usage with Claude Code

Add to your Claude Code MCP configuration:

```json
{
  "mcpServers": {
    "google-marketing": {
      "command": "node",
      "args": ["/path/to/mcp-google-marketing/dist/index.js"]
    }
  }
}
```

## Available Tools

### Google Analytics 4 (22 tools)

#### Account & Property Management
- `ga4_list_accounts` - List all GA4 accounts
- `ga4_list_properties` - List properties for an account
- `ga4_create_property` - Create a new GA4 property
- `ga4_get_property` - Get property details
- `ga4_update_property` - Update property settings
- `ga4_delete_property` - Delete a property

#### Data Streams
- `ga4_list_data_streams` - List data streams for a property
- `ga4_create_web_stream` - Create a web data stream
- `ga4_create_app_stream` - Create an app data stream
- `ga4_update_data_stream` - Update data stream settings
- `ga4_get_measurement_id` - Get measurement ID for a stream

#### Conversion Events
- `ga4_list_conversion_events` - List conversion events
- `ga4_create_conversion_event` - Create a conversion event
- `ga4_delete_conversion_event` - Delete a conversion event

#### Reporting
- `ga4_get_realtime` - Get real-time visitor data
- `ga4_run_report` - Run a custom report with dimensions and metrics
- `ga4_run_pivot_report` - Run a pivot table report
- `ga4_batch_run_reports` - Run multiple reports in a single request

#### Custom Dimensions & Metrics
- `ga4_list_custom_dimensions` - List custom dimensions
- `ga4_create_custom_dimension` - Create a custom dimension
- `ga4_list_custom_metrics` - List custom metrics
- `ga4_create_custom_metric` - Create a custom metric

### Google Search Console (6 tools)

#### Site Management
- `gsc_list_sites` - List all verified sites
- `gsc_get_site` - Get site details

#### Search Analytics
- `gsc_search_analytics` - Query search performance data (impressions, clicks, CTR, position)

#### Sitemaps
- `gsc_list_sitemaps` - List submitted sitemaps
- `gsc_submit_sitemap` - Submit a new sitemap
- `gsc_delete_sitemap` - Delete a sitemap

### Google AdSense (6 tools)

#### Account Management
- `adsense_list_accounts` - List all AdSense accounts
- `adsense_get_account` - Get account details

#### Ad Clients & Units
- `adsense_list_ad_clients` - List ad clients for an account
- `adsense_list_ad_units` - List ad units for an ad client

#### Payments & Reports
- `adsense_list_payments` - List payments for an account
- `adsense_generate_report` - Generate earnings report with metrics and dimensions

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

### Search Console: Query Search Analytics

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

### AdSense: Generate Earnings Report

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

## Development

```bash
# Install dependencies
npm install

# Run type checking
npm run typecheck

# Run tests
npm test

# Build
npm run build

# Run MCP Inspector
task inspector
```

## Required Permissions

### Google Analytics

Grant your service account the following roles in Google Analytics:
- **Viewer** - For read-only access
- **Editor** - For creating/modifying properties, streams, and events

### Google Search Console

Add your service account email as a user with appropriate access level:
- **Full** - For all operations including sitemap management
- **Restricted** - For read-only access

### Google AdSense

Add your service account email in AdSense:
1. Go to Account → Access and authorization → Manage users
2. Add the service account email with appropriate permissions

## License

MIT
