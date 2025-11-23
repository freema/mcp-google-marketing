import { describe, it, expect } from 'vitest';
import { allTools, allHandlers } from '../../src/tools/index.js';

describe('tools index', () => {
  describe('allTools', () => {
    it('should export all 34 tools', () => {
      expect(allTools.length).toBe(34);
    });

    it('should have unique tool names', () => {
      const names = allTools.map((t) => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should have GA4 tools', () => {
      const ga4Tools = allTools.filter((t) => t.name.startsWith('ga4_'));
      expect(ga4Tools.length).toBe(22);
    });

    it('should have Search Console tools', () => {
      const gscTools = allTools.filter((t) => t.name.startsWith('gsc_'));
      expect(gscTools.length).toBe(6);
    });

    it('should have AdSense tools', () => {
      const adsenseTools = allTools.filter((t) => t.name.startsWith('adsense_'));
      expect(adsenseTools.length).toBe(6);
    });

    it('all tools should have required properties', () => {
      for (const tool of allTools) {
        expect(tool.name).toBeDefined();
        expect(typeof tool.name).toBe('string');
        expect(tool.description).toBeDefined();
        expect(typeof tool.description).toBe('string');
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
      }
    });
  });

  describe('allHandlers', () => {
    it('should have handlers for all tools', () => {
      const handlerNames = Object.keys(allHandlers);
      expect(handlerNames.length).toBe(34);

      for (const tool of allTools) {
        expect(allHandlers[tool.name]).toBeDefined();
        expect(typeof allHandlers[tool.name]).toBe('function');
      }
    });

    it('should have GA4 handlers', () => {
      expect(allHandlers.ga4_list_accounts).toBeDefined();
      expect(allHandlers.ga4_list_properties).toBeDefined();
      expect(allHandlers.ga4_run_report).toBeDefined();
      expect(allHandlers.ga4_get_realtime).toBeDefined();
    });

    it('should have Search Console handlers', () => {
      expect(allHandlers.gsc_list_sites).toBeDefined();
      expect(allHandlers.gsc_search_analytics).toBeDefined();
      expect(allHandlers.gsc_list_sitemaps).toBeDefined();
    });

    it('should have AdSense handlers', () => {
      expect(allHandlers.adsense_list_accounts).toBeDefined();
      expect(allHandlers.adsense_list_ad_clients).toBeDefined();
      expect(allHandlers.adsense_generate_report).toBeDefined();
    });
  });
});
