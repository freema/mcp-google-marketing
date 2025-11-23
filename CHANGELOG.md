# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-23

### Added

- **Google Analytics 4 (GA4)** - 22 tools for comprehensive analytics management
  - Account and property management (list, create, update, delete)
  - Data streams management (web and app streams)
  - Conversion events tracking
  - Custom dimensions and metrics
  - Reporting (standard, pivot, batch, realtime)

- **Google Search Console** - 6 tools for search performance
  - Site management (list, get)
  - Search analytics queries
  - Sitemap management (list, submit, delete)

- **Google AdSense** - 6 tools for ad revenue management
  - Account management (list, get)
  - Ad clients and ad units listing
  - Payments history
  - Revenue reports generation

- **OAuth 2.0 Authentication**
  - Browser-based OAuth flow for easy setup
  - Automatic token refresh
  - Cross-platform token storage

- **Developer Experience**
  - Full TypeScript support
  - Comprehensive error messages with actionable instructions
  - MCP Inspector support for debugging

### Technical Details

- Built with Model Context Protocol (MCP) SDK
- Uses official Google APIs (@google-analytics/admin, @google-analytics/data, googleapis)
- Zod schema validation for all tool inputs
- ESM module format
- Node.js 20+ required

## [Unreleased]

### Planned

- Google Ads integration
- Additional AdSense management capabilities
- Batch operations support

---

[1.0.0]: https://github.com/freema/mcp-google-marketing/releases/tag/v1.0.0
[Unreleased]: https://github.com/freema/mcp-google-marketing/compare/v1.0.0...HEAD
