import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { CreateAppStreamInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const createAppStreamTool = {
  name: 'ga4_create_app_stream',
  description: 'Create a mobile app data stream for a GA4 property',
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
      packageName: {
        type: 'string',
        description: 'iOS bundle ID or Android package name',
      },
      platform: {
        type: 'string',
        enum: ['IOS', 'ANDROID'],
        description: 'Platform type',
      },
    },
    required: ['propertyId', 'displayName', 'packageName', 'platform'],
  },
};

export async function handleCreateAppStream(
  args: z.infer<typeof CreateAppStreamInputSchema>
): Promise<ToolResponse> {
  try {
    const { propertyId, displayName, packageName, platform } =
      CreateAppStreamInputSchema.parse(args);

    const client = await getAnalyticsAdminClient();

    const dataStream: {
      displayName: string;
      type: string;
      iosAppStreamData?: { bundleId: string };
      androidAppStreamData?: { packageName: string };
    } = {
      displayName,
      type: platform === 'IOS' ? 'IOS_APP_DATA_STREAM' : 'ANDROID_APP_DATA_STREAM',
    };

    if (platform === 'IOS') {
      dataStream.iosAppStreamData = { bundleId: packageName };
    } else {
      dataStream.androidAppStreamData = { packageName };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [stream] = (await client.createDataStream({
      parent: propertyId,
      dataStream: dataStream as any,
    })) as any[];

    return createToolResponse({
      streamId: stream.name,
      displayName: stream.displayName,
      type: stream.type,
      platform,
      packageName:
        platform === 'IOS'
          ? stream.iosAppStreamData?.bundleId
          : stream.androidAppStreamData?.packageName,
      firebaseAppId:
        platform === 'IOS'
          ? stream.iosAppStreamData?.firebaseAppId
          : stream.androidAppStreamData?.firebaseAppId,
      createTime: stream.createTime,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to create app stream: ${message}`);
  }
}
