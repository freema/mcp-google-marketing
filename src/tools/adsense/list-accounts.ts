import { getAdsenseClient } from '../../utils/google-auth.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';
import { formatGoogleApiError } from '../../utils/error-messages.js';

export const listAccountsTool = {
  name: 'adsense_list_accounts',
  description: 'List all AdSense accounts accessible by the service account',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
};

export async function handleListAccounts(): Promise<ToolResponse> {
  try {
    const adsense = await getAdsenseClient();
    const response = await adsense.accounts.list();

    const accounts = (response.data.accounts || []).map((account) => ({
      name: account.name,
      displayName: account.displayName,
      state: account.state,
      createTime: account.createTime,
      timeZone: account.timeZone?.id,
      reportingTimeZone: account.reportingTimeZone?.id,
    }));

    return createToolResponse({
      accounts,
      count: accounts.length,
    });
  } catch (error) {
    return createErrorResponse(formatGoogleApiError(error, 'Failed to list AdSense accounts'));
  }
}
