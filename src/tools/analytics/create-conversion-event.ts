import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { CreateConversionEventInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const createConversionEventTool = {
  name: 'ga4_create_conversion_event',
  description: 'Mark an event as a conversion in GA4',
  inputSchema: {
    type: 'object' as const,
    properties: {
      propertyId: {
        type: 'string',
        description: 'GA4 property ID (e.g., "properties/123456789")',
      },
      eventName: {
        type: 'string',
        description: 'Event name to mark as conversion',
      },
    },
    required: ['propertyId', 'eventName'],
  },
};

export async function handleCreateConversionEvent(
  args: z.infer<typeof CreateConversionEventInputSchema>
): Promise<ToolResponse> {
  try {
    const { propertyId, eventName } = CreateConversionEventInputSchema.parse(args);

    const client = await getAnalyticsAdminClient();
    const [event] = await client.createConversionEvent({
      parent: propertyId,
      conversionEvent: {
        eventName,
      },
    });

    return createToolResponse({
      success: true,
      name: event.name,
      eventName: event.eventName,
      createTime: event.createTime,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to create conversion event: ${message}`);
  }
}
