import { z } from 'zod';

// Site Management Schemas
export const ListSitesInputSchema = z.object({});

export const GetSiteInputSchema = z.object({
  siteUrl: z.string().describe('Site URL (e.g., "https://example.com/" or "sc-domain:example.com")'),
});

// Search Analytics Schema
export const SearchAnalyticsInputSchema = z.object({
  siteUrl: z.string().describe('Site URL'),
  startDate: z.string().describe('Start date (YYYY-MM-DD)'),
  endDate: z.string().describe('End date (YYYY-MM-DD)'),
  dimensions: z
    .array(z.enum(['country', 'device', 'page', 'query', 'searchAppearance', 'date']))
    .optional()
    .describe('Dimensions to group by'),
  type: z
    .enum(['web', 'image', 'video', 'news', 'discover', 'googleNews'])
    .optional()
    .describe('Search type filter'),
  dimensionFilterGroups: z
    .array(
      z.object({
        groupType: z.enum(['and']).optional(),
        filters: z.array(
          z.object({
            dimension: z.enum(['country', 'device', 'page', 'query', 'searchAppearance']),
            operator: z.enum(['contains', 'equals', 'notContains', 'notEquals', 'includingRegex', 'excludingRegex']),
            expression: z.string(),
          })
        ),
      })
    )
    .optional()
    .describe('Filter groups for query'),
  aggregationType: z
    .enum(['auto', 'byPage', 'byProperty'])
    .optional()
    .describe('How to aggregate data'),
  rowLimit: z.number().min(1).max(25000).optional().describe('Maximum rows to return (default 1000, max 25000)'),
  startRow: z.number().min(0).optional().describe('Row offset for pagination'),
  dataState: z.enum(['all', 'final']).optional().describe('Data freshness (all includes fresh data)'),
});

// Sitemap Schemas
export const ListSitemapsInputSchema = z.object({
  siteUrl: z.string().describe('Site URL'),
});

export const SubmitSitemapInputSchema = z.object({
  siteUrl: z.string().describe('Site URL'),
  feedpath: z.string().describe('Full URL of the sitemap (e.g., "https://example.com/sitemap.xml")'),
});

export const DeleteSitemapInputSchema = z.object({
  siteUrl: z.string().describe('Site URL'),
  feedpath: z.string().describe('Full URL of the sitemap to delete'),
});
