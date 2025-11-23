import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { CreateWebStreamInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const createWebStreamTool = {
  name: 'ga4_create_web_stream',
  description: 'Create a web data stream for a GA4 property',
  inputSchema: {
    type: 'object' as const,
    properties: {
      propertyId: {
        type: 'string',
        description: 'GA4 property ID (e.g., "properties/123456789")',
      },
      displayName: {
        type: 'string',
        description: 'Display name for the stream',
      },
      defaultUri: {
        type: 'string',
        description: 'Default URI (e.g., "https://example.com")',
      },
    },
    required: ['propertyId', 'displayName', 'defaultUri'],
  },
};

export async function handleCreateWebStream(
  args: z.infer<typeof CreateWebStreamInputSchema>
): Promise<ToolResponse> {
  try {
    const { propertyId, displayName, defaultUri } = CreateWebStreamInputSchema.parse(args);

    const client = await getAnalyticsAdminClient();
    const [stream] = await client.createDataStream({
      parent: propertyId,
      dataStream: {
        displayName,
        type: 'WEB_DATA_STREAM',
        webStreamData: {
          defaultUri,
        },
      },
    });

    return createToolResponse({
      streamId: stream.name,
      displayName: stream.displayName,
      type: stream.type,
      measurementId: stream.webStreamData?.measurementId,
      defaultUri: stream.webStreamData?.defaultUri,
      createTime: stream.createTime,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to create web stream: ${message}`);
  }
}
