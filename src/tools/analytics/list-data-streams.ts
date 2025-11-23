import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { ListDataStreamsInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const listDataStreamsTool = {
  name: 'ga4_list_data_streams',
  description: 'List all data streams for a GA4 property',
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

export async function handleListDataStreams(
  args: z.infer<typeof ListDataStreamsInputSchema>
): Promise<ToolResponse> {
  try {
    const { propertyId } = ListDataStreamsInputSchema.parse(args);

    const client = await getAnalyticsAdminClient();
    const [streams] = await client.listDataStreams({
      parent: propertyId,
    });

    const result = (streams || []).map((stream) => ({
      streamId: stream.name,
      displayName: stream.displayName,
      type: stream.type,
      createTime: stream.createTime,
      updateTime: stream.updateTime,
      webStreamData: stream.webStreamData
        ? {
            measurementId: stream.webStreamData.measurementId,
            defaultUri: stream.webStreamData.defaultUri,
          }
        : undefined,
      androidAppStreamData: stream.androidAppStreamData
        ? {
            packageName: stream.androidAppStreamData.packageName,
            firebaseAppId: stream.androidAppStreamData.firebaseAppId,
          }
        : undefined,
      iosAppStreamData: stream.iosAppStreamData
        ? {
            bundleId: stream.iosAppStreamData.bundleId,
            firebaseAppId: stream.iosAppStreamData.firebaseAppId,
          }
        : undefined,
    }));

    return createToolResponse({
      dataStreams: result,
      count: result.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to list data streams: ${message}`);
  }
}
