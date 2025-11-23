import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { UpdatePropertyInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const updatePropertyTool = {
  name: 'ga4_update_property',
  description: 'Update settings of a GA4 property',
  inputSchema: {
    type: 'object' as const,
    properties: {
      propertyId: {
        type: 'string',
        description: 'GA4 property ID (e.g., "properties/123456789")',
      },
      displayName: {
        type: 'string',
        description: 'New display name (optional)',
      },
      timeZone: {
        type: 'string',
        description: 'New time zone (optional)',
      },
      currencyCode: {
        type: 'string',
        description: 'New currency code (optional)',
      },
    },
    required: ['propertyId'],
  },
};

export async function handleUpdateProperty(
  args: z.infer<typeof UpdatePropertyInputSchema>
): Promise<ToolResponse> {
  try {
    const { propertyId, displayName, timeZone, currencyCode } =
      UpdatePropertyInputSchema.parse(args);

    const client = await getAnalyticsAdminClient();

    const updateMask: string[] = [];
    const property: {
      name: string;
      displayName?: string;
      timeZone?: string;
      currencyCode?: string;
    } = { name: propertyId };

    if (displayName !== undefined) {
      property.displayName = displayName;
      updateMask.push('displayName');
    }
    if (timeZone !== undefined) {
      property.timeZone = timeZone;
      updateMask.push('timeZone');
    }
    if (currencyCode !== undefined) {
      property.currencyCode = currencyCode;
      updateMask.push('currencyCode');
    }

    if (updateMask.length === 0) {
      return createErrorResponse(
        'No fields to update. Provide at least one of: displayName, timeZone, currencyCode'
      );
    }

    const [updatedProperty] = await client.updateProperty({
      property,
      updateMask: { paths: updateMask },
    });

    return createToolResponse({
      propertyId: updatedProperty.name,
      displayName: updatedProperty.displayName,
      timeZone: updatedProperty.timeZone,
      currencyCode: updatedProperty.currencyCode,
      updateTime: updatedProperty.updateTime,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to update GA4 property: ${message}`);
  }
}
