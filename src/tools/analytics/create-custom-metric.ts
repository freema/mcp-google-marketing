import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { CreateCustomMetricInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const createCustomMetricTool = {
  name: 'ga4_create_custom_metric',
  description: 'Create a custom metric in GA4',
  inputSchema: {
    type: 'object' as const,
    properties: {
      propertyId: {
        type: 'string',
        description: 'GA4 property ID (e.g., "properties/123456789")',
      },
      parameterName: {
        type: 'string',
        description: 'Event parameter name to use',
      },
      displayName: {
        type: 'string',
        description: 'Display name for the metric',
      },
      measurementUnit: {
        type: 'string',
        enum: [
          'STANDARD',
          'CURRENCY',
          'FEET',
          'METERS',
          'KILOMETERS',
          'MILES',
          'MILLISECONDS',
          'SECONDS',
          'MINUTES',
          'HOURS',
        ],
        description: 'Measurement unit',
      },
      description: {
        type: 'string',
        description: 'Description (optional)',
      },
    },
    required: ['propertyId', 'parameterName', 'displayName', 'measurementUnit'],
  },
};

export async function handleCreateCustomMetric(
  args: z.infer<typeof CreateCustomMetricInputSchema>
): Promise<ToolResponse> {
  try {
    const { propertyId, parameterName, displayName, measurementUnit, description } =
      CreateCustomMetricInputSchema.parse(args);

    const client = await getAnalyticsAdminClient();

    const customMetric: {
      parameterName: string;
      displayName: string;
      measurementUnit: string;
      scope: string;
      description?: string;
    } = {
      parameterName,
      displayName,
      measurementUnit: `MEASUREMENT_UNIT_${measurementUnit}`,
      scope: 'METRIC_SCOPE_EVENT',
    };

    if (description) {
      customMetric.description = description;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [metric] = (await client.createCustomMetric({
      parent: propertyId,
      customMetric: customMetric as any,
    })) as any[];

    return createToolResponse({
      name: metric.name,
      parameterName: metric.parameterName,
      displayName: metric.displayName,
      measurementUnit: metric.measurementUnit,
      scope: metric.scope,
      description: metric.description,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to create custom metric: ${message}`);
  }
}
