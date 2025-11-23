import { z } from 'zod';
import { getSearchConsoleClient } from '../../utils/google-auth.js';
import { DeleteSitemapInputSchema } from '../../types/search-console.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const deleteSitemapTool = {
  name: 'gsc_delete_sitemap',
  description: 'Delete a sitemap from Google Search Console',
  inputSchema: {
    type: 'object' as const,
    properties: {
      siteUrl: {
        type: 'string',
        description: 'Site URL',
      },
      feedpath: {
        type: 'string',
        description: 'Full URL of the sitemap to delete',
      },
    },
    required: ['siteUrl', 'feedpath'],
  },
};

export async function handleDeleteSitemap(
  args: z.infer<typeof DeleteSitemapInputSchema>
): Promise<ToolResponse> {
  try {
    const { siteUrl, feedpath } = DeleteSitemapInputSchema.parse(args);

    const client = await getSearchConsoleClient();

    await client.sitemaps.delete({
      siteUrl,
      feedpath,
    });

    return createToolResponse({
      success: true,
      message: `Sitemap ${feedpath} deleted successfully from ${siteUrl}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to delete sitemap: ${message}`);
  }
}
