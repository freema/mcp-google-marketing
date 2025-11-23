import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { CreatePropertyInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const createPropertyTool = {
  name: 'ga4_create_property',
  description: 'Create a new GA4 property under an account',
  inputSchema: {
    type: 'object' as const,
    properties: {
      accountId: {
        type: 'string',
        description: 'GA4 account ID (e.g., "accounts/123456")',
      },
      displayName: {
        type: 'string',
        description: 'Display name for the property',
      },
      timeZone: {
        type: 'string',
        description: 'Time zone (e.g., "Europe/Prague")',
      },
      currencyCode: {
        type: 'string',
        description: 'Currency code (e.g., "CZK", "USD")',
      },
      industryCategory: {
        type: 'string',
        description: 'Industry category (optional)',
      },
    },
    required: ['accountId', 'displayName', 'timeZone', 'currencyCode'],
  },
};

export async function handleCreateProperty(
  args: z.infer<typeof CreatePropertyInputSchema>
): Promise<ToolResponse> {
  try {
    const { accountId, displayName, timeZone, currencyCode, industryCategory } =
      CreatePropertyInputSchema.parse(args);

    const client = await getAnalyticsAdminClient();

    const propertyData: {
      parent: string;
      displayName: string;
      timeZone: string;
      currencyCode: string;
      industryCategory?: string;
    } = {
      parent: accountId,
      displayName,
      timeZone,
      currencyCode,
    };

    if (industryCategory) {
      propertyData.industryCategory = industryCategory;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [property] = (await client.createProperty({
      property: propertyData as any,
    })) as any[];

    return createToolResponse({
      propertyId: property.name,
      displayName: property.displayName,
      timeZone: property.timeZone,
      currencyCode: property.currencyCode,
      createTime: property.createTime,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to create GA4 property: ${message}`);
  }
}
