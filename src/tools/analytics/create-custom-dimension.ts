import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { CreateCustomDimensionInputSchema } from '../../types/analytics.js';
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
 * Map scope string to numeric enum value
 * Based on @google-analytics/admin protos:
 * - EVENT = 1
 * - USER = 2
 * - ITEM = 3
 */
function mapScopeToEnum(scope: string): number {
  const scopeMap: Record<string, number> = {
    EVENT: 1,
    USER: 2,
    ITEM: 3,
  };
  return scopeMap[scope] || 1; // Default to EVENT if unknown
}

export const createCustomDimensionTool = {
  name: 'ga4_create_custom_dimension',
  description: 'Create a custom dimension in GA4',
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
          'Display name for the dimension (special characters will be replaced with underscores)',
      },
      scope: {
        type: 'string',
        enum: ['EVENT', 'USER', 'ITEM'],
        description: 'Dimension scope',
      },
      description: {
        type: 'string',
        description: 'Description (optional)',
      },
    },
    required: ['propertyId', 'parameterName', 'displayName', 'scope'],
  },
};

export async function handleCreateCustomDimension(
  args: z.infer<typeof CreateCustomDimensionInputSchema>
): Promise<ToolResponse> {
  try {
    const { propertyId, parameterName, displayName, scope, description } =
      CreateCustomDimensionInputSchema.parse(args);

    const client = await getAnalyticsAdminClient();

    // Sanitize displayName to remove invalid characters
    const sanitizedDisplayName = sanitizeDisplayName(displayName);

    const customDimension: {
      parameterName: string;
      displayName: string;
      scope: number;
      description?: string;
    } = {
      parameterName,
      displayName: sanitizedDisplayName,
      scope: mapScopeToEnum(scope),
    };

    if (description) {
      customDimension.description = description;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [dimension] = (await client.createCustomDimension({
      parent: propertyId,
      customDimension: customDimension as any,
    })) as any[];

    return createToolResponse({
      name: dimension.name,
      parameterName: dimension.parameterName,
      displayName: dimension.displayName,
      scope: dimension.scope,
      description: dimension.description,
      note:
        sanitizedDisplayName !== displayName
          ? `displayName was sanitized from "${displayName}" to "${sanitizedDisplayName}"`
          : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to create custom dimension: ${message}`);
  }
}
