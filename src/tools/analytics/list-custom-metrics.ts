import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { ListCustomMetricsInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const listCustomMetricsTool = {
  name: 'ga4_list_custom_metrics',
  description: 'List all custom metrics for a GA4 property',
  inputSchema: {
    type: 'object' as const,
    properties: {
      propertyId: {
        type: 'string',
        description: 'GA4 property ID (e.g., "properties/123456789")',
      },
    },
    required: ['propertyId'],
  },
};

export async function handleListCustomMetrics(
  args: z.infer<typeof ListCustomMetricsInputSchema>
): Promise<ToolResponse> {
  try {
    const { propertyId } = ListCustomMetricsInputSchema.parse(args);

    const client = await getAnalyticsAdminClient();
    const [metrics] = await client.listCustomMetrics({
      parent: propertyId,
    });

    const result = (metrics || []).map((metric) => ({
      name: metric.name,
      parameterName: metric.parameterName,
      displayName: metric.displayName,
      scope: metric.scope,
      measurementUnit: metric.measurementUnit,
      description: metric.description,
    }));

    return createToolResponse({
      customMetrics: result,
      count: result.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to list custom metrics: ${message}`);
  }
}
