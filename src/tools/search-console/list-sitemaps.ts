import { z } from 'zod';
import { getSearchConsoleClient } from '../../utils/google-auth.js';
import { ListSitemapsInputSchema } from '../../types/search-console.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const listSitemapsTool = {
  name: 'gsc_list_sitemaps',
  description: 'List all sitemaps submitted for a site in Google Search Console',
  inputSchema: {
    type: 'object' as const,
    properties: {
      siteUrl: {
        type: 'string',
        description: 'Site URL',
      },
    },
    required: ['siteUrl'],
  },
};

export async function handleListSitemaps(
  args: z.infer<typeof ListSitemapsInputSchema>
): Promise<ToolResponse> {
  try {
    const { siteUrl } = ListSitemapsInputSchema.parse(args);

    const client = await getSearchConsoleClient();

    const response = await client.sitemaps.list({
      siteUrl,
    });

    const sitemaps = (response.data.sitemap || []).map((sitemap) => ({
      path: sitemap.path,
      lastSubmitted: sitemap.lastSubmitted,
      isPending: sitemap.isPending,
      isSitemapsIndex: sitemap.isSitemapsIndex,
      type: sitemap.type,
      lastDownloaded: sitemap.lastDownloaded,
      warnings: sitemap.warnings,
      errors: sitemap.errors,
      contents: sitemap.contents?.map((content) => ({
        type: content.type,
        submitted: content.submitted,
        indexed: content.indexed,
      })),
    }));

    return createToolResponse({
      sitemapsCount: sitemaps.length,
      sitemaps,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to list sitemaps: ${message}`);
  }
}
