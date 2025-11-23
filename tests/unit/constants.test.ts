import { describe, it, expect } from 'vitest';
import {
  GOOGLE_SCOPES,
  ALL_SCOPES,
  API_VERSIONS,
  GA4_LIMITS,
  GSC_LIMITS,
  ADSENSE_LIMITS,
  RETRY_CONFIG,
} from '../../src/config/constants.js';

describe('constants', () => {
  describe('GOOGLE_SCOPES', () => {
    it('should have analytics edit scope', () => {
      expect(GOOGLE_SCOPES.ANALYTICS_EDIT).toBe('https://www.googleapis.com/auth/analytics.edit');
    });

    it('should have analytics readonly scope', () => {
      expect(GOOGLE_SCOPES.ANALYTICS_READONLY).toBe('https://www.googleapis.com/auth/analytics.readonly');
    });

    it('should have webmasters scope', () => {
      expect(GOOGLE_SCOPES.WEBMASTERS).toBe('https://www.googleapis.com/auth/webmasters');
    });

    it('should have adsense readonly scope', () => {
      expect(GOOGLE_SCOPES.ADSENSE_READONLY).toBe('https://www.googleapis.com/auth/adsense.readonly');
    });
  });

  describe('ALL_SCOPES', () => {
    it('should contain all scopes', () => {
      expect(ALL_SCOPES).toContain(GOOGLE_SCOPES.ANALYTICS_EDIT);
      expect(ALL_SCOPES).toContain(GOOGLE_SCOPES.ANALYTICS_READONLY);
      expect(ALL_SCOPES).toContain(GOOGLE_SCOPES.WEBMASTERS);
      expect(ALL_SCOPES).toContain(GOOGLE_SCOPES.ADSENSE_READONLY);
    });

    it('should have correct length', () => {
      expect(ALL_SCOPES.length).toBe(Object.keys(GOOGLE_SCOPES).length);
    });
  });

  describe('API_VERSIONS', () => {
    it('should have GA4 admin version', () => {
      expect(API_VERSIONS.GA4_ADMIN).toBe('v1');
    });

    it('should have GA4 data version', () => {
      expect(API_VERSIONS.GA4_DATA).toBe('v1beta');
    });

    it('should have Search Console version', () => {
      expect(API_VERSIONS.SEARCH_CONSOLE).toBe('v1');
    });

    it('should have AdSense version', () => {
      expect(API_VERSIONS.ADSENSE).toBe('v2');
    });
  });

  describe('GA4_LIMITS', () => {
    it('should have GA4 limits defined', () => {
      expect(GA4_LIMITS.maxDimensionsPerReport).toBe(9);
      expect(GA4_LIMITS.maxMetricsPerReport).toBe(10);
      expect(GA4_LIMITS.maxRowsPerReport).toBe(100000);
    });
  });

  describe('GSC_LIMITS', () => {
    it('should have Search Console limits defined', () => {
      expect(GSC_LIMITS.maxRowsPerRequest).toBe(25000);
      expect(GSC_LIMITS.maxDateRange).toBe(16);
    });
  });

  describe('ADSENSE_LIMITS', () => {
    it('should have AdSense limits defined', () => {
      expect(ADSENSE_LIMITS.maxRowsPerRequest).toBe(50000);
    });
  });

  describe('RETRY_CONFIG', () => {
    it('should have retry configuration', () => {
      expect(RETRY_CONFIG.maxRetries).toBe(3);
      expect(RETRY_CONFIG.initialDelay).toBe(1000);
      expect(RETRY_CONFIG.maxDelay).toBe(10000);
      expect(RETRY_CONFIG.factor).toBe(2);
    });
  });
});
