import { describe, it, expect } from 'vitest';
import { adsenseTools, adsenseHandlers } from '../../src/tools/adsense/index.js';

describe('AdSense Tools', () => {
  describe('tools definition', () => {
    it('should export all AdSense tools', () => {
      expect(adsenseTools).toHaveLength(6);
    });

    it('should have correct tool names', () => {
      const toolNames = adsenseTools.map((t) => t.name);
      expect(toolNames).toContain('adsense_list_accounts');
      expect(toolNames).toContain('adsense_get_account');
      expect(toolNames).toContain('adsense_list_ad_clients');
      expect(toolNames).toContain('adsense_list_ad_units');
      expect(toolNames).toContain('adsense_list_payments');
      expect(toolNames).toContain('adsense_generate_report');
    });

    it('should have descriptions for all tools', () => {
      for (const tool of adsenseTools) {
        expect(tool.description).toBeDefined();
        expect(tool.description.length).toBeGreaterThan(0);
      }
    });

    it('should have input schemas for all tools', () => {
      for (const tool of adsenseTools) {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
      }
    });
  });

  describe('handlers', () => {
    it('should export handlers for all tools', () => {
      expect(Object.keys(adsenseHandlers)).toHaveLength(6);
    });

    it('should have matching handlers for each tool', () => {
      for (const tool of adsenseTools) {
        expect(adsenseHandlers[tool.name]).toBeDefined();
        expect(typeof adsenseHandlers[tool.name]).toBe('function');
      }
    });
  });
});
