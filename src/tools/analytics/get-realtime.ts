import { z } from 'zod';
import { getAnalyticsDataClient } from '../../utils/google-auth.js';
import { GetRealtimeInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const getRealtimeTool = {
  name: 'ga4_get_realtime',
  description: 'Get real-time visitor data from GA4',
  inputSchema: {
    type: 'object' as const,
    properties: {
      propertyId: {
        type: 'string',
        description: 'GA4 property ID (e.g., "properties/123456789")',
      },
      dimensions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Dimensions (e.g., ["country", "city", "deviceCategory"])',
      },
      metrics: {
        type: 'array',
        items: { type: 'string' },
        description: 'Metrics (e.g., ["activeUsers", "screenPageViews"])',
      },
    },
    required: ['propertyId'],
  },
};

export async function handleGetRealtime(
  args: z.infer<typeof GetRealtimeInputSchema>
): Promise<ToolResponse> {
  try {
    const { propertyId, dimensions, metrics } = GetRealtimeInputSchema.parse(args);

    const client = await getAnalyticsDataClient();

    const request: {
      property: string;
      dimensions?: Array<{ name: string }>;
      metrics: Array<{ name: string }>;
    } = {
      property: propertyId,
      metrics: (metrics || ['activeUsers']).map((name) => ({ name })),
    };

    if (dimensions && dimensions.length > 0) {
      request.dimensions = dimensions.map((name) => ({ name }));
    }

    const [response] = await client.runRealtimeReport(request);

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
      metricHeaders: response.metricHeaders?.map((h) => h.name),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to get realtime data: ${message}`);
  }
}
