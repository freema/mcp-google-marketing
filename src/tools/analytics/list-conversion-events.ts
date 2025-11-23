import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { ListConversionEventsInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const listConversionEventsTool = {
  name: 'ga4_list_conversion_events',
  description: 'List all conversion events for a GA4 property',
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

export async function handleListConversionEvents(
  args: z.infer<typeof ListConversionEventsInputSchema>
): Promise<ToolResponse> {
  try {
    const { propertyId } = ListConversionEventsInputSchema.parse(args);

    const client = await getAnalyticsAdminClient();
    const [events] = await client.listConversionEvents({
      parent: propertyId,
    });

    const result = (events || []).map((event) => ({
      name: event.name,
      eventName: event.eventName,
      createTime: event.createTime,
      deletable: event.deletable,
      custom: event.custom,
    }));

    return createToolResponse({
      conversionEvents: result,
      count: result.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to list conversion events: ${message}`);
  }
}
