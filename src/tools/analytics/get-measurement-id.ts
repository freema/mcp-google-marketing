import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { GetMeasurementIdInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const getMeasurementIdTool = {
  name: 'ga4_get_measurement_id',
  description: 'Get the measurement ID (G-XXXXXXXXXX) for a web data stream',
  inputSchema: {
    type: 'object' as const,
    properties: {
      streamId: {
        type: 'string',
        description: 'Full stream ID (e.g., "properties/123/dataStreams/456")',
      },
    },
    required: ['streamId'],
  },
};

export async function handleGetMeasurementId(
  args: z.infer<typeof GetMeasurementIdInputSchema>
): Promise<ToolResponse> {
  try {
    const { streamId } = GetMeasurementIdInputSchema.parse(args);

    const client = await getAnalyticsAdminClient();
    const [stream] = await client.getDataStream({
      name: streamId,
    });

    if (!stream.webStreamData?.measurementId) {
      return createErrorResponse(
        'This stream does not have a measurement ID. Only web streams have measurement IDs.'
      );
    }

    return createToolResponse({
      streamId: stream.name,
      displayName: stream.displayName,
      measurementId: stream.webStreamData.measurementId,
      defaultUri: stream.webStreamData.defaultUri,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to get measurement ID: ${message}`);
  }
}
