import { getAdsenseClient } from '../../utils/google-auth.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';
import { formatGoogleApiError } from '../../utils/error-messages.js';
import { AccountIdSchema } from '../../types/adsense.js';

export const listPaymentsTool = {
  name: 'adsense_list_payments',
  description: 'List payments for an AdSense account',
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

export async function handleListPayments(args: unknown): Promise<ToolResponse> {
  try {
    const { accountId } = AccountIdSchema.parse(args);
    const adsense = await getAdsenseClient();

    const response = await adsense.accounts.payments.list({
      parent: accountId,
    });

    const payments = (response.data.payments || []).map((payment) => ({
      name: payment.name,
      amount: payment.amount,
      date: payment.date,
    }));

    return createToolResponse({
      payments,
      count: payments.length,
    });
  } catch (error) {
    return createErrorResponse(formatGoogleApiError(error, 'Failed to list AdSense payments'));
  }
}
