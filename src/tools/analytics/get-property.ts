import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { GetPropertyInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const getPropertyTool = {
  name: 'ga4_get_property',
  description: 'Get details of a specific GA4 property',
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

export async function handleGetProperty(
  args: z.infer<typeof GetPropertyInputSchema>
): Promise<ToolResponse> {
  try {
    const { propertyId } = GetPropertyInputSchema.parse(args);

    const client = await getAnalyticsAdminClient();
    const [property] = await client.getProperty({
      name: propertyId,
    });

    return createToolResponse({
      propertyId: property.name,
      displayName: property.displayName,
      timeZone: property.timeZone,
      currencyCode: property.currencyCode,
      industryCategory: property.industryCategory,
      serviceLevel: property.serviceLevel,
      createTime: property.createTime,
      updateTime: property.updateTime,
      parent: property.parent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to get GA4 property: ${message}`);
  }
}
