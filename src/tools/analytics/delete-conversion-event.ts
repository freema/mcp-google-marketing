import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { DeleteConversionEventInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const deleteConversionEventTool = {
  name: 'ga4_delete_conversion_event',
  description: 'Remove conversion marking from an event in GA4',
  inputSchema: {
    type: 'object' as const,
    properties: {
      propertyId: {
        type: 'string',
        description: 'GA4 property ID (e.g., "properties/123456789")',
      },
      eventName: {
        type: 'string',
        description: 'Event name to unmark as conversion',
      },
    },
    required: ['propertyId', 'eventName'],
  },
};

export async function handleDeleteConversionEvent(
  args: z.infer<typeof DeleteConversionEventInputSchema>
): Promise<ToolResponse> {
  try {
    const { propertyId, eventName } = DeleteConversionEventInputSchema.parse(args);

    const client = await getAnalyticsAdminClient();

    // First, find the conversion event by name
    const [events] = await client.listConversionEvents({
      parent: propertyId,
    });

    const conversionEvent = events?.find((e) => e.eventName === eventName);
    if (!conversionEvent) {
      return createErrorResponse(`Conversion event "${eventName}" not found`);
    }

    if (!conversionEvent.deletable) {
      return createErrorResponse(
        `Conversion event "${eventName}" cannot be deleted (system-defined conversion)`
      );
    }

    await client.deleteConversionEvent({
      name: conversionEvent.name!,
    });

    return createToolResponse({
      success: true,
      message: `Conversion event "${eventName}" has been removed`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to delete conversion event: ${message}`);
  }
}
