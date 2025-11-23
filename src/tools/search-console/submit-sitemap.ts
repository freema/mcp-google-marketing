import { z } from 'zod';
import { getSearchConsoleClient } from '../../utils/google-auth.js';
import { SubmitSitemapInputSchema } from '../../types/search-console.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const submitSitemapTool = {
  name: 'gsc_submit_sitemap',
  description: 'Submit a sitemap to Google Search Console',
  inputSchema: {
    type: 'object' as const,
    properties: {
      siteUrl: {
        type: 'string',
        description: 'Site URL',
      },
      feedpath: {
        type: 'string',
        description: 'Full URL of the sitemap (e.g., "https://example.com/sitemap.xml")',
      },
    },
    required: ['siteUrl', 'feedpath'],
  },
};

export async function handleSubmitSitemap(
  args: z.infer<typeof SubmitSitemapInputSchema>
): Promise<ToolResponse> {
  try {
    const { siteUrl, feedpath } = SubmitSitemapInputSchema.parse(args);

    const client = await getSearchConsoleClient();

    await client.sitemaps.submit({
      siteUrl,
      feedpath,
    });

    return createToolResponse({
      success: true,
      message: `Sitemap ${feedpath} submitted successfully for ${siteUrl}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to submit sitemap: ${message}`);
  }
}
