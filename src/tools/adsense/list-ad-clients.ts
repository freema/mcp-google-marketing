import { getAdsenseClient } from '../../utils/google-auth.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';
import { formatGoogleApiError } from '../../utils/error-messages.js';
import { ListAdClientsSchema } from '../../types/adsense.js';

export const listAdClientsTool = {
  name: 'adsense_list_ad_clients',
  description: 'List all ad clients for an AdSense account',
  inputSchema: {
    type: 'object' as const,
    properties: {
      accountId: {
        type: 'string',
        description: 'AdSense account ID (e.g., "accounts/pub-1234567890123456")',
      },
      pageSize: {
        type: 'number',
        description: 'Maximum number of ad clients to return (default 50)',
      },
    },
    required: ['accountId'],
  },
};

export async function handleListAdClients(args: unknown): Promise<ToolResponse> {
  try {
    const { accountId, pageSize } = ListAdClientsSchema.parse(args);
    const adsense = await getAdsenseClient();

    const response = await adsense.accounts.adclients.list({
      parent: accountId,
      pageSize: pageSize || 50,
    });

    const adClients = (response.data.adClients || []).map((client) => ({
      name: client.name,
      reportingDimensionId: client.reportingDimensionId,
      productCode: client.productCode,
      state: client.state,
    }));

    return createToolResponse({
      adClients,
      count: adClients.length,
    });
  } catch (error) {
    return createErrorResponse(formatGoogleApiError(error, 'Failed to list AdSense ad clients'));
  }
}
