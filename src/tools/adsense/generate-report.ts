import { getAdsenseClient } from '../../utils/google-auth.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';
import { formatGoogleApiError } from '../../utils/error-messages.js';
import { GenerateReportSchema } from '../../types/adsense.js';

export const generateReportTool = {
  name: 'adsense_generate_report',
  description: 'Generate an AdSense report with earnings, page views, clicks, and impressions',
  inputSchema: {
    type: 'object' as const,
    properties: {
      accountId: {
        type: 'string',
        description: 'AdSense account ID (e.g., "accounts/pub-1234567890123456")',
      },
      startDate: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD)',
      },
      endDate: {
        type: 'string',
        description: 'End date (YYYY-MM-DD)',
      },
      metrics: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Metrics to include (default: ESTIMATED_EARNINGS, PAGE_VIEWS, CLICKS, IMPRESSIONS)',
      },
      dimensions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Dimensions to group by (e.g., DATE, COUNTRY_NAME, AD_UNIT_NAME)',
      },
    },
    required: ['accountId', 'startDate', 'endDate'],
  },
};

export async function handleGenerateReport(args: unknown): Promise<ToolResponse> {
  try {
    const { accountId, startDate, endDate, metrics, dimensions } = GenerateReportSchema.parse(args);
    const adsense = await getAdsenseClient();

    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

    const defaultMetrics = ['ESTIMATED_EARNINGS', 'PAGE_VIEWS', 'CLICKS', 'IMPRESSIONS'];
    const requestMetrics = metrics || defaultMetrics;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (adsense.accounts.reports.generate as any)({
      account: accountId,
      'dateRange.startDate.year': startYear,
      'dateRange.startDate.month': startMonth,
      'dateRange.startDate.day': startDay,
      'dateRange.endDate.year': endYear,
      'dateRange.endDate.month': endMonth,
      'dateRange.endDate.day': endDay,
      metrics: requestMetrics,
      dimensions: dimensions || ['DATE'],
    });

    const headers = response.data?.headers?.map((h: { name?: string }) => h.name) || [];
    const rows = (response.data?.rows || []).map((row: { cells?: Array<{ value?: string }> }) => {
      const rowData: Record<string, unknown> = {};
      row.cells?.forEach((cell, index) => {
        const header = headers[index] || `col${index}`;
        rowData[header] = cell.value;
      });
      return rowData;
    });

    return createToolResponse({
      dateRange: { startDate, endDate },
      headers,
      rows,
      rowCount: rows.length,
      totals: response.data?.totals,
      averages: response.data?.averages,
    });
  } catch (error) {
    return createErrorResponse(formatGoogleApiError(error, 'Failed to generate AdSense report'));
  }
}
