import { z } from 'zod';

export const AccountIdSchema = z.object({
  accountId: z.string().describe('AdSense account ID (e.g., "accounts/pub-1234567890123456")'),
});

export const ListAdClientsSchema = z.object({
  accountId: z.string().describe('AdSense account ID'),
  pageSize: z.number().optional().describe('Maximum number of ad clients to return (default 50)'),
});

export const ListAdUnitsSchema = z.object({
  accountId: z.string().describe('AdSense account ID'),
  adClientId: z.string().describe('Ad client ID (e.g., "ca-pub-1234567890123456")'),
  pageSize: z.number().optional().describe('Maximum number of ad units to return (default 50)'),
});

export const GenerateReportSchema = z.object({
  accountId: z.string().describe('AdSense account ID'),
  startDate: z.string().describe('Start date (YYYY-MM-DD)'),
  endDate: z.string().describe('End date (YYYY-MM-DD)'),
  metrics: z.array(z.string()).optional().describe('Metrics to include (default: ESTIMATED_EARNINGS, PAGE_VIEWS, CLICKS, IMPRESSIONS)'),
  dimensions: z.array(z.string()).optional().describe('Dimensions to group by (e.g., DATE, COUNTRY_NAME, AD_UNIT_NAME)'),
});

export type AccountIdInput = z.infer<typeof AccountIdSchema>;
export type ListAdClientsInput = z.infer<typeof ListAdClientsSchema>;
export type ListAdUnitsInput = z.infer<typeof ListAdUnitsSchema>;
export type GenerateReportInput = z.infer<typeof GenerateReportSchema>;
