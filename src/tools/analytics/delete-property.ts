import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { DeletePropertyInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const deletePropertyTool = {
  name: 'ga4_delete_property',
  description: 'Soft-delete a GA4 property (moves to trash, can be recovered within 35 days)',
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

export async function handleDeleteProperty(
  args: z.infer<typeof DeletePropertyInputSchema>
): Promise<ToolResponse> {
  try {
    const { propertyId } = DeletePropertyInputSchema.parse(args);

    const client = await getAnalyticsAdminClient();
    const [property] = await client.deleteProperty({
      name: propertyId,
    });

    return createToolResponse({
      success: true,
      message: `Property ${propertyId} has been moved to trash`,
      deletedProperty: {
        propertyId: property.name,
        displayName: property.displayName,
        deleteTime: property.deleteTime,
        expireTime: property.expireTime,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to delete GA4 property: ${message}`);
  }
}
