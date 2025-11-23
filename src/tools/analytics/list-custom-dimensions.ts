import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { ListCustomDimensionsInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const listCustomDimensionsTool = {
  name: 'ga4_list_custom_dimensions',
  description: 'List all custom dimensions for a GA4 property',
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

export async function handleListCustomDimensions(
  args: z.infer<typeof ListCustomDimensionsInputSchema>
): Promise<ToolResponse> {
  try {
    const { propertyId } = ListCustomDimensionsInputSchema.parse(args);

    const client = await getAnalyticsAdminClient();
    const [dimensions] = await client.listCustomDimensions({
      parent: propertyId,
    });

    const result = (dimensions || []).map((dim) => ({
      name: dim.name,
      parameterName: dim.parameterName,
      displayName: dim.displayName,
      scope: dim.scope,
      description: dim.description,
      disallowAdsPersonalization: dim.disallowAdsPersonalization,
    }));

    return createToolResponse({
      customDimensions: result,
      count: result.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to list custom dimensions: ${message}`);
  }
}
