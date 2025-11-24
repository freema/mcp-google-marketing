import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { CreateCustomMetricInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

/**
 * Sanitize displayName for GA4 API
 * - Only allows letters, numbers, spaces, and underscores
 * - Replaces other characters with underscores
 * - Trims leading/trailing whitespace
 */
function sanitizeDisplayName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9\s_]/g, '_') // Replace invalid chars with underscore
    .replace(/_+/g, '_') // Collapse multiple underscores
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
}

/**
 * Map measurementUnit string to numeric enum value
 * Based on @google-analytics/admin protos
 */
function mapMeasurementUnitToEnum(unit: string): number {
  const unitMap: Record<string, number> = {
    STANDARD: 1,
    CURRENCY: 2,
    FEET: 3,
    METERS: 4,
    KILOMETERS: 5,
    MILES: 6,
    MILLISECONDS: 7,
    SECONDS: 8,
    MINUTES: 9,
    HOURS: 10,
  };
  return unitMap[unit] || 1; // Default to STANDARD if unknown
}

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
        description:
          'Display name for the metric (special characters will be replaced with underscores)',
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

    // Sanitize displayName to remove invalid characters
    const sanitizedDisplayName = sanitizeDisplayName(displayName);

    const customMetric: {
      parameterName: string;
      displayName: string;
      measurementUnit: number;
      scope: number;
      description?: string;
    } = {
      parameterName,
      displayName: sanitizedDisplayName,
      measurementUnit: mapMeasurementUnitToEnum(measurementUnit),
      scope: 1, // EVENT = 1 (only valid scope for custom metrics)
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
      note:
        sanitizedDisplayName !== displayName
          ? `displayName was sanitized from "${displayName}" to "${sanitizedDisplayName}"`
          : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to create custom metric: ${message}`);
  }
}
