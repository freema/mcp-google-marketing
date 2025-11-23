import { describe, it, expect, vi } from 'vitest';
import { tools as searchConsoleTools, handlers as searchConsoleHandlers } from '../../src/tools/search-console/index.js';

// Mock the google-auth module
vi.mock('../../src/utils/google-auth.js', () => ({
  getSearchConsoleClient: vi.fn(),
}));

describe('search console tools', () => {
  describe('tool definitions', () => {
    it('should have 6 search console tools', () => {
      expect(searchConsoleTools.length).toBe(6);
    });

    it('should have site management tools', () => {
      const siteTools = ['gsc_list_sites', 'gsc_get_site'];
      for (const name of siteTools) {
        const tool = searchConsoleTools.find((t) => t.name === name);
        expect(tool).toBeDefined();
      }
    });

    it('should have search analytics tool', () => {
      const tool = searchConsoleTools.find((t) => t.name === 'gsc_search_analytics');
      expect(tool).toBeDefined();
    });

    it('should have sitemap tools', () => {
      const sitemapTools = ['gsc_list_sitemaps', 'gsc_submit_sitemap', 'gsc_delete_sitemap'];
      for (const name of sitemapTools) {
        const tool = searchConsoleTools.find((t) => t.name === name);
        expect(tool).toBeDefined();
      }
    });
  });

  describe('handlers', () => {
    it('should have handler for each tool', () => {
      for (const tool of searchConsoleTools) {
        expect(searchConsoleHandlers[tool.name]).toBeDefined();
        expect(typeof searchConsoleHandlers[tool.name]).toBe('function');
      }
    });
  });

  describe('input schemas', () => {
    it('gsc_list_sites should have no required params', () => {
      const tool = searchConsoleTools.find((t) => t.name === 'gsc_list_sites');
      expect(tool?.inputSchema.required?.length ?? 0).toBe(0);
    });

    it('gsc_get_site should require siteUrl', () => {
      const tool = searchConsoleTools.find((t) => t.name === 'gsc_get_site');
      expect(tool?.inputSchema.required).toContain('siteUrl');
    });

    it('gsc_search_analytics should require siteUrl, startDate, endDate', () => {
      const tool = searchConsoleTools.find((t) => t.name === 'gsc_search_analytics');
      expect(tool?.inputSchema.required).toContain('siteUrl');
      expect(tool?.inputSchema.required).toContain('startDate');
      expect(tool?.inputSchema.required).toContain('endDate');
    });

    it('gsc_submit_sitemap should require siteUrl and feedpath', () => {
      const tool = searchConsoleTools.find((t) => t.name === 'gsc_submit_sitemap');
      expect(tool?.inputSchema.required).toContain('siteUrl');
      expect(tool?.inputSchema.required).toContain('feedpath');
    });
  });
});
