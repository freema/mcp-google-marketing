import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { CreateCustomDimensionInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

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
        description: 'Display name for the dimension',
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

    const customDimension: {
      parameterName: string;
      displayName: string;
      scope: string;
      description?: string;
    } = {
      parameterName,
      displayName,
      scope: `DIMENSION_SCOPE_${scope}`,
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
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to create custom dimension: ${message}`);
  }
}
