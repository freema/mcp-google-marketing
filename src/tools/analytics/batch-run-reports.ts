import { z } from 'zod';
import { getAnalyticsDataClient } from '../../utils/google-auth.js';
import { BatchRunReportsInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const batchRunReportsTool = {
  name: 'ga4_batch_run_reports',
  description: 'Run multiple GA4 reports in a single request',
  inputSchema: {
    type: 'object' as const,
    properties: {
      propertyId: {
        type: 'string',
        description: 'GA4 property ID (e.g., "properties/123456789")',
      },
      requests: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
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
            },
            dimensions: {
              type: 'array',
              items: { type: 'string' },
            },
            metrics: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['dateRanges', 'dimensions', 'metrics'],
        },
        description: 'Array of report requests',
      },
    },
    required: ['propertyId', 'requests'],
  },
};

export async function handleBatchRunReports(
  args: z.infer<typeof BatchRunReportsInputSchema>
): Promise<ToolResponse> {
  try {
    const { propertyId, requests } = BatchRunReportsInputSchema.parse(args);

    const client = await getAnalyticsDataClient();

    const [response] = await client.batchRunReports({
      property: propertyId,
      requests: requests.map((req) => ({
        dateRanges: req.dateRanges,
        dimensions: req.dimensions.map((name) => ({ name })),
        metrics: req.metrics.map((name) => ({ name })),
      })),
    });

    const reports = (response.reports || []).map((report) => {
      const rows = (report.rows || []).map((row) => {
        const result: Record<string, string | null | undefined> = {};

        report.dimensionHeaders?.forEach((header, i) => {
          if (header.name) {
            result[header.name] = row.dimensionValues?.[i]?.value;
          }
        });

        report.metricHeaders?.forEach((header, i) => {
          if (header.name) {
            result[header.name] = row.metricValues?.[i]?.value;
          }
        });

        return result;
      });

      return {
        rowCount: report.rowCount,
        rows,
        dimensionHeaders: report.dimensionHeaders?.map((h) => h.name),
        metricHeaders: report.metricHeaders?.map((h) => h.name),
      };
    });

    return createToolResponse({
      reportsCount: reports.length,
      reports,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to batch run reports: ${message}`);
  }
}
