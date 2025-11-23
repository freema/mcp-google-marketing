import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { UpdateDataStreamInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const updateDataStreamTool = {
  name: 'ga4_update_data_stream',
  description: 'Update a data stream settings',
  inputSchema: {
    type: 'object' as const,
    properties: {
      streamId: {
        type: 'string',
        description: 'Full stream ID (e.g., "properties/123/dataStreams/456")',
      },
      displayName: {
        type: 'string',
        description: 'New display name (optional)',
      },
    },
    required: ['streamId'],
  },
};

export async function handleUpdateDataStream(
  args: z.infer<typeof UpdateDataStreamInputSchema>
): Promise<ToolResponse> {
  try {
    const { streamId, displayName } = UpdateDataStreamInputSchema.parse(args);

    if (!displayName) {
      return createErrorResponse('No fields to update. Provide displayName.');
    }

    const client = await getAnalyticsAdminClient();
    const [stream] = await client.updateDataStream({
      dataStream: {
        name: streamId,
        displayName,
      },
      updateMask: { paths: ['displayName'] },
    });

    return createToolResponse({
      streamId: stream.name,
      displayName: stream.displayName,
      type: stream.type,
      updateTime: stream.updateTime,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to update data stream: ${message}`);
  }
}
