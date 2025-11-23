import { getAdsenseClient } from '../../utils/google-auth.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';
import { formatGoogleApiError } from '../../utils/error-messages.js';
import { AccountIdSchema } from '../../types/adsense.js';

export const getAccountTool = {
  name: 'adsense_get_account',
  description: 'Get details for a specific AdSense account',
  inputSchema: {
    type: 'object' as const,
    properties: {
      accountId: {
        type: 'string',
        description: 'AdSense account ID (e.g., "accounts/pub-1234567890123456")',
      },
    },
    required: ['accountId'],
  },
};

export async function handleGetAccount(args: unknown): Promise<ToolResponse> {
  try {
    const { accountId } = AccountIdSchema.parse(args);
    const adsense = await getAdsenseClient();

    const response = await adsense.accounts.get({
      name: accountId,
    });

    return createToolResponse({
      name: response.data.name,
      displayName: response.data.displayName,
      state: response.data.state,
      createTime: response.data.createTime,
      timeZone: response.data.timeZone?.id,
      reportingTimeZone: response.data.reportingTimeZone?.id,
      premium: response.data.premium,
    });
  } catch (error) {
    return createErrorResponse(formatGoogleApiError(error, 'Failed to get AdSense account'));
  }
}
