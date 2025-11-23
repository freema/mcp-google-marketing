import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolResponse } from '../../types/common.js';

// Tool definitions
export { listSitesTool, handleListSites } from './list-sites.js';
export { getSiteTool, handleGetSite } from './get-site.js';
export { searchAnalyticsTool, handleSearchAnalytics } from './search-analytics.js';
export { listSitemapsTool, handleListSitemaps } from './list-sitemaps.js';
export { submitSitemapTool, handleSubmitSitemap } from './submit-sitemap.js';
export { deleteSitemapTool, handleDeleteSitemap } from './delete-sitemap.js';

// Re-import for array
import { listSitesTool, handleListSites } from './list-sites.js';
import { getSiteTool, handleGetSite } from './get-site.js';
import { searchAnalyticsTool, handleSearchAnalytics } from './search-analytics.js';
import { listSitemapsTool, handleListSitemaps } from './list-sitemaps.js';
import { submitSitemapTool, handleSubmitSitemap } from './submit-sitemap.js';
import { deleteSitemapTool, handleDeleteSitemap } from './delete-sitemap.js';

export const tools: Tool[] = [
  listSitesTool,
  getSiteTool,
  searchAnalyticsTool,
  listSitemapsTool,
  submitSitemapTool,
  deleteSitemapTool,
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handlers: Record<string, (args: any) => Promise<ToolResponse>> = {
  gsc_list_sites: handleListSites,
  gsc_get_site: handleGetSite,
  gsc_search_analytics: handleSearchAnalytics,
  gsc_list_sitemaps: handleListSitemaps,
  gsc_submit_sitemap: handleSubmitSitemap,
  gsc_delete_sitemap: handleDeleteSitemap,
};
