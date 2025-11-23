import { z } from 'zod';
import { getAnalyticsDataClient } from '../../utils/google-auth.js';
import { RunReportInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const runReportTool = {
  name: 'ga4_run_report',
  description: 'Run a custom GA4 report with dimensions and metrics',
  inputSchema: {
    type: 'object' as const,
    properties: {
      propertyId: {
        type: 'string',
        description: 'GA4 property ID (e.g., "properties/123456789")',
      },
      dateRanges: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            startDate: { type: 'string' },
            endDate: { type: 'string' },
          },
          required: ['startDate', 'endDate'],
        },
        description: 'Date ranges (e.g., [{"startDate": "30daysAgo", "endDate": "today"}])',
      },
      dimensions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Dimensions (e.g., ["date", "country", "pagePath"])',
      },
      metrics: {
        type: 'array',
        items: { type: 'string' },
        description: 'Metrics (e.g., ["sessions", "totalUsers", "screenPageViews"])',
      },
      limit: {
        type: 'number',
        description: 'Maximum rows to return (default 10000)',
      },
      offset: {
        type: 'number',
        description: 'Row offset for pagination',
      },
    },
    required: ['propertyId', 'dateRanges', 'dimensions', 'metrics'],
  },
};

export async function handleRunReport(
  args: z.infer<typeof RunReportInputSchema>
): Promise<ToolResponse> {
  try {
    const { propertyId, dateRanges, dimensions, metrics, limit, offset } =
      RunReportInputSchema.parse(args);

    const client = await getAnalyticsDataClient();

    const request: {
      property: string;
      dateRanges: Array<{ startDate: string; endDate: string }>;
      dimensions: Array<{ name: string }>;
      metrics: Array<{ name: string }>;
      limit?: number;
      offset?: number;
    } = {
      property: propertyId,
      dateRanges,
      dimensions: dimensions.map((name) => ({ name })),
      metrics: metrics.map((name) => ({ name })),
    };

    if (limit !== undefined) {
      request.limit = limit;
    }
    if (offset !== undefined) {
      request.offset = offset;
    }

    const [response] = await client.runReport(request);

    const rows = (response.rows || []).map((row) => {
      const result: Record<string, string | null | undefined> = {};

      response.dimensionHeaders?.forEach((header, i) => {
        if (header.name) {
          result[header.name] = row.dimensionValues?.[i]?.value;
        }
      });

      response.metricHeaders?.forEach((header, i) => {
        if (header.name) {
          result[header.name] = row.metricValues?.[i]?.value;
        }
      });

      return result;
    });

    return createToolResponse({
      rowCount: response.rowCount,
      rows,
      dimensionHeaders: response.dimensionHeaders?.map((h) => h.name),
      metricHeaders: response.metricHeaders?.map((h) => ({
        name: h.name,
        type: h.type,
      })),
      metadata: {
        currencyCode: response.metadata?.currencyCode,
        timeZone: response.metadata?.timeZone,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to run report: ${message}`);
  }
}
