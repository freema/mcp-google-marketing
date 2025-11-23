import { z } from 'zod';
import { getAnalyticsAdminClient } from '../../utils/google-auth.js';
import { ListAccountsInputSchema } from '../../types/analytics.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const listAccountsTool = {
  name: 'ga4_list_accounts',
  description: 'List all GA4 accounts accessible by the authenticated user',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [] as string[],
  },
};

export async function handleListAccounts(
  args: z.infer<typeof ListAccountsInputSchema>
): Promise<ToolResponse> {
  try {
    ListAccountsInputSchema.parse(args);

    const client = await getAnalyticsAdminClient();
    const [accounts] = await client.listAccounts({});

    const result = (accounts || []).map((account) => ({
      accountId: account.name,
      displayName: account.displayName,
      createTime: account.createTime,
      updateTime: account.updateTime,
      regionCode: account.regionCode,
    }));

    return createToolResponse({
      accounts: result,
      count: result.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to list GA4 accounts: ${message}`);
  }
}
