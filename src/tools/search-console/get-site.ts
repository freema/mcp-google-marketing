import { z } from 'zod';
import { getSearchConsoleClient } from '../../utils/google-auth.js';
import { GetSiteInputSchema } from '../../types/search-console.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const getSiteTool = {
  name: 'gsc_get_site',
  description: 'Get information about a specific site in Google Search Console',
  inputSchema: {
    type: 'object' as const,
    properties: {
      siteUrl: {
        type: 'string',
        description: 'Site URL (e.g., "https://example.com/" or "sc-domain:example.com")',
      },
    },
    required: ['siteUrl'],
  },
};

export async function handleGetSite(
  args: z.infer<typeof GetSiteInputSchema>
): Promise<ToolResponse> {
  try {
    const { siteUrl } = GetSiteInputSchema.parse(args);

    const client = await getSearchConsoleClient();

    const response = await client.sites.get({
      siteUrl,
    });

    return createToolResponse({
      siteUrl: response.data.siteUrl,
      permissionLevel: response.data.permissionLevel,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to get site: ${message}`);
  }
}
