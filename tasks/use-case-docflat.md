# Use Case: DocFlat.com Marketing Setup

## Primary Use Case - DocFlat.com Setup

**Main goal:** Use this MCP server through Claude Code to fully configure Google Analytics 4, Google Ads, and Google Search Console for docflat.com from scratch.

---

## Typical Workflow Example

### Step 1 - GA4 Setup via Claude Code

```
User: "Set up Google Analytics 4 for docflat.com"

Claude Code executes:
1. ga4_create_property (name: "DocFlat", timezone: "Europe/Prague", currency: "CZK")
2. ga4_create_web_stream (url: "https://docflat.com")
3. Get measurement ID (G-XXXXXXXXXX)
4. Configure custom events:
   - pdf_upload
   - pdf_conversion_started
   - pdf_conversion_completed
   - markdown_download
   - premium_feature_used
5. Mark conversions:
   - pdf_conversion_completed
   - premium_feature_used
6. Create custom dimensions:
   - file_size (event scope)
   - conversion_type (event scope)
   - user_plan (user scope)
```

### Step 2 - Search Console Setup

```
User: "Connect docflat.com to Search Console"

Claude Code executes:
1. gsc_verify_site (if not verified)
2. gsc_submit_sitemap ("https://docflat.com/sitemap.xml")
3. gsc_search_analytics (initial baseline)
```

### Step 3 - Google Ads Setup

```
User: "Set up Google Ads campaign for DocFlat"

Claude Code executes:
1. ads_create_campaign
2. ads_link_to_analytics (for conversion tracking)
3. ads_setup_conversion_tracking
```

---

## Design Implications

### The tools should support conversational setup:
- Claude Code should be able to ask clarifying questions
- Tools should provide helpful defaults
- Return measurement IDs and setup instructions clearly
- Generate code snippets for installation (e.g., GA4 tag for Next.js)

### Tool output should include:
- Success confirmations
- Next steps (e.g., "Add this measurement ID to your Next.js config")
- Relevant console URLs (e.g., direct link to property in GA4 console)
- Code snippets where applicable

### Example tool response format:

```json
{
  "success": true,
  "property_id": "properties/123456789",
  "measurement_id": "G-XXXXXXXXXX",
  "next_steps": [
    "Add measurement ID to your Next.js app",
    "Install @next/third-parties or react-ga4",
    "Configure custom events in your code"
  ],
  "console_url": "https://analytics.google.com/analytics/web/#/p123456789",
  "code_snippet": {
    "language": "typescript",
    "file": "app/layout.tsx",
    "code": "// GA4 implementation example..."
  }
}
```

---

## DocFlat-Specific Events to Support

Tools should make it easy to set up these conversion events:

| Event Name | Description | Conversion? |
|------------|-------------|-------------|
| `pdf_upload` | User uploads a PDF file | No |
| `pdf_conversion_started` | Conversion process begins | No |
| `pdf_conversion_completed` | PDF successfully converted to Markdown | Yes |
| `markdown_download` | User downloads the result | No |
| `premium_feature_used` | User uses OCR, advanced formatting, etc. | Yes |
| `user_signup` | New user registration | Yes |
| `share_action` | User shares converted document | No |

### Custom Dimensions for DocFlat:

| Dimension | Scope | Description |
|-----------|-------|-------------|
| `file_size` | EVENT | Size of uploaded PDF |
| `conversion_type` | EVENT | Type of conversion (basic, OCR, etc.) |
| `user_plan` | USER | Free, Premium, Enterprise |
| `page_count` | EVENT | Number of pages in PDF |

---

## Integration with Next.js

Since DocFlat is a Next.js app, tools should be aware of:

### Considerations:
- Server-side vs client-side tracking
- App Router vs Pages Router
- Recommended libraries (@next/third-parties, react-ga4)
- Environment variable setup (.env.local)

### Example Next.js Integration Output:

When `ga4_create_web_stream` completes, it should suggest:

```typescript
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
      <GoogleAnalytics gaId="G-XXXXXXXXXX" />
    </html>
  )
}
```

And for custom events:

```typescript
// lib/analytics.ts
import { sendGAEvent } from '@next/third-parties/google'

export function trackPdfConversion(fileSize: number, conversionType: string) {
  sendGAEvent('event', 'pdf_conversion_completed', {
    file_size: fileSize,
    conversion_type: conversionType,
  })
}
```

---

## Additional Requirements for Practical Usage

### Configuration Management
- Support for multiple websites/projects in config
- Easy switching between projects via Claude Code
- Store recent setups for quick reference

### Helper Tools (Future Phase)
- `generate_nextjs_snippet` - generate ready-to-use Next.js integration code
- `validate_setup` - check if GA4 is receiving data correctly
- `get_implementation_guide` - return step-by-step setup for specific platform

### Claude Code Friendly Responses
- Clear, actionable responses
- Include URLs to Google consoles
- Suggest next logical steps
- Validate inputs before API calls
- Provide code examples when relevant

---

## Success Scenario

After using the MCP server through Claude Code, DocFlat should have:

1. **GA4 Property** fully configured with:
   - Web data stream with measurement ID
   - All custom events defined
   - Conversion events marked
   - Custom dimensions set up

2. **Search Console** connected with:
   - Site verified
   - Sitemap submitted
   - Baseline search data available

3. **Google Ads** ready with:
   - Campaign structure in place
   - Conversion tracking linked to GA4
   - Ready for ad creation

4. **Next.js Integration** with:
   - GA4 snippet ready to paste
   - Custom event tracking functions
   - Environment variables documented
