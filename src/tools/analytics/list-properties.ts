import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { ListPropertiesInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const listPropertiesTool = {
  name: 'ga4_list_properties',
  description: 'List all GA4 properties under a specific account',
  inputSchema: {
    type: 'object' as const,
    properties: {
      accountId: {
        type: 'string',
        description: 'GA4 account ID (e.g., "accounts/123456")',
      },
    },
    required: ['accountId'],
  },
};

export async function handleListProperties(
  args: z.infer<typeof ListPropertiesInputSchema>
): Promise<ToolResponse> {
  try {
    const { accountId } = ListPropertiesInputSchema.parse(args);

    const client = await getAnalyticsAdminClient();
    const [properties] = await client.listProperties({
      filter: `parent:${accountId}`,
    });

    const result = (properties || []).map((property) => ({
      propertyId: property.name,
      displayName: property.displayName,
      timeZone: property.timeZone,
      currencyCode: property.currencyCode,
      industryCategory: property.industryCategory,
      serviceLevel: property.serviceLevel,
      createTime: property.createTime,
      updateTime: property.updateTime,
    }));

    return createToolResponse({
      properties: result,
      count: result.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to list GA4 properties: ${message}`);
  }
}
