import { getSearchConsoleClient } from '../../utils/google-auth.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const listSitesTool = {
  name: 'gsc_list_sites',
  description: 'List all sites you have access to in Google Search Console',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
};

export async function handleListSites(): Promise<ToolResponse> {
  try {
    const client = await getSearchConsoleClient();

    const response = await client.sites.list();

    const sites = (response.data.siteEntry || []).map((site) => ({
      siteUrl: site.siteUrl,
      permissionLevel: site.permissionLevel,
    }));

    return createToolResponse({
      sitesCount: sites.length,
      sites,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to list sites: ${message}`);
  }
}
