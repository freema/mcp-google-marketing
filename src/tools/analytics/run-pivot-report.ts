import { z } from 'zod';
import { getAnalyticsDataClient } from '../../utils/google-auth.js';
import { RunPivotReportInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const runPivotReportTool = {
  name: 'ga4_run_pivot_report',
  description: 'Run a pivot table report in GA4',
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
        description: 'Date ranges for the report',
      },
      dimensions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Dimensions',
      },
      metrics: {
        type: 'array',
        items: { type: 'string' },
        description: 'Metrics',
      },
      pivots: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            fieldNames: {
              type: 'array',
              items: { type: 'string' },
            },
            limit: { type: 'number' },
          },
          required: ['fieldNames'],
        },
        description: 'Pivot configurations',
      },
    },
    required: ['propertyId', 'dateRanges', 'dimensions', 'metrics', 'pivots'],
  },
};

export async function handleRunPivotReport(
  args: z.infer<typeof RunPivotReportInputSchema>
): Promise<ToolResponse> {
  try {
    const { propertyId, dateRanges, dimensions, metrics, pivots } =
      RunPivotReportInputSchema.parse(args);

    const client = await getAnalyticsDataClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [response] = (await client.runPivotReport({
      property: propertyId,
      dateRanges,
      dimensions: dimensions.map((name) => ({ name })),
      metrics: metrics.map((name) => ({ name })),
      pivots: pivots.map((pivot) => ({
        fieldNames: pivot.fieldNames,
        limit: pivot.limit,
      })),
    } as any)) as any[];

    const rows = (response.rows || []).map((row) => {
      const result: Record<string, unknown> = {};

      response.dimensionHeaders?.forEach((header, i) => {
        if (header.name) {
          result[header.name] = row.dimensionValues?.[i]?.value;
        }
      });

      result.metricValues = row.metricValues?.map((mv) => mv.value);

      return result;
    });

    return createToolResponse({
      rowCount: response.rows?.length || 0,
      rows,
      pivotHeaders: response.pivotHeaders?.map((ph) => ({
        pivotDimensionHeaders: ph.pivotDimensionHeaders?.map((pdh) => ({
          dimensionValues: pdh.dimensionValues?.map((dv) => dv.value),
        })),
      })),
      dimensionHeaders: response.dimensionHeaders?.map((h) => h.name),
      metricHeaders: response.metricHeaders?.map((h) => h.name),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to run pivot report: ${message}`);
  }
}
