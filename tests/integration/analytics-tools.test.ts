import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tools as analyticsTools, handlers as analyticsHandlers } from '../../src/tools/analytics/index.js';

// Mock the google-auth module
vi.mock('../../src/utils/google-auth.js', () => ({
  getAnalyticsAdminClient: vi.fn(),
  getAnalyticsDataClient: vi.fn(),
}));

describe('analytics tools', () => {
  describe('tool definitions', () => {
    it('should have 22 analytics tools', () => {
      expect(analyticsTools.length).toBe(22);
    });

    it('should have management tools', () => {
      const managementTools = ['ga4_list_accounts', 'ga4_list_properties', 'ga4_create_property', 'ga4_get_property', 'ga4_update_property', 'ga4_delete_property'];
      for (const name of managementTools) {
        const tool = analyticsTools.find((t) => t.name === name);
        expect(tool).toBeDefined();
      }
    });

    it('should have data stream tools', () => {
      const streamTools = ['ga4_list_data_streams', 'ga4_create_web_stream', 'ga4_create_app_stream', 'ga4_update_data_stream', 'ga4_get_measurement_id'];
      for (const name of streamTools) {
        const tool = analyticsTools.find((t) => t.name === name);
        expect(tool).toBeDefined();
      }
    });

    it('should have conversion tools', () => {
      const conversionTools = ['ga4_list_conversion_events', 'ga4_create_conversion_event', 'ga4_delete_conversion_event'];
      for (const name of conversionTools) {
        const tool = analyticsTools.find((t) => t.name === name);
        expect(tool).toBeDefined();
      }
    });

    it('should have reporting tools', () => {
      const reportTools = ['ga4_get_realtime', 'ga4_run_report', 'ga4_run_pivot_report', 'ga4_batch_run_reports'];
      for (const name of reportTools) {
        const tool = analyticsTools.find((t) => t.name === name);
        expect(tool).toBeDefined();
      }
    });

    it('should have custom dimension/metric tools', () => {
      const customTools = ['ga4_list_custom_dimensions', 'ga4_create_custom_dimension', 'ga4_list_custom_metrics', 'ga4_create_custom_metric'];
      for (const name of customTools) {
        const tool = analyticsTools.find((t) => t.name === name);
        expect(tool).toBeDefined();
      }
    });
  });

  describe('handlers', () => {
    it('should have handler for each tool', () => {
      for (const tool of analyticsTools) {
        expect(analyticsHandlers[tool.name]).toBeDefined();
        expect(typeof analyticsHandlers[tool.name]).toBe('function');
      }
    });
  });

  describe('input schemas', () => {
    it('ga4_list_properties should require accountId', () => {
      const tool = analyticsTools.find((t) => t.name === 'ga4_list_properties');
      expect(tool?.inputSchema.required).toContain('accountId');
    });

    it('ga4_run_report should require propertyId, dateRanges, dimensions, metrics', () => {
      const tool = analyticsTools.find((t) => t.name === 'ga4_run_report');
      expect(tool?.inputSchema.required).toContain('propertyId');
      expect(tool?.inputSchema.required).toContain('dateRanges');
      expect(tool?.inputSchema.required).toContain('dimensions');
      expect(tool?.inputSchema.required).toContain('metrics');
    });

    it('ga4_get_realtime should require only propertyId', () => {
      const tool = analyticsTools.find((t) => t.name === 'ga4_get_realtime');
      expect(tool?.inputSchema.required).toContain('propertyId');
      expect(tool?.inputSchema.required?.length).toBe(1);
    });
  });
});
