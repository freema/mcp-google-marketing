import { getAdsenseClient } from '../../utils/google-auth.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';
import { formatGoogleApiError } from '../../utils/error-messages.js';
import { ListAdUnitsSchema } from '../../types/adsense.js';

export const listAdUnitsTool = {
  name: 'adsense_list_ad_units',
  description: 'List all ad units for an ad client',
  inputSchema: {
    type: 'object' as const,
    properties: {
      accountId: {
        type: 'string',
        description: 'AdSense account ID (e.g., "accounts/pub-1234567890123456")',
      },
      adClientId: {
        type: 'string',
        description: 'Ad client ID (e.g., "ca-pub-1234567890123456")',
      },
      pageSize: {
        type: 'number',
        description: 'Maximum number of ad units to return (default 50)',
      },
    },
    required: ['accountId', 'adClientId'],
  },
};

export async function handleListAdUnits(args: unknown): Promise<ToolResponse> {
  try {
    const { accountId, adClientId, pageSize } = ListAdUnitsSchema.parse(args);
    const adsense = await getAdsenseClient();

    const response = await adsense.accounts.adclients.adunits.list({
      parent: `${accountId}/adclients/${adClientId}`,
      pageSize: pageSize || 50,
    });

    const adUnits = (response.data.adUnits || []).map((unit) => ({
      name: unit.name,
      displayName: unit.displayName,
      reportingDimensionId: unit.reportingDimensionId,
      state: unit.state,
      contentAdsSettings: unit.contentAdsSettings,
    }));

    return createToolResponse({
      adUnits,
      count: adUnits.length,
    });
  } catch (error) {
    return createErrorResponse(formatGoogleApiError(error, 'Failed to list AdSense ad units'));
  }
}
