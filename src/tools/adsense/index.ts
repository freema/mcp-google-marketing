import { listAccountsTool, handleListAccounts } from './list-accounts.js';
import { getAccountTool, handleGetAccount } from './get-account.js';
import { listAdClientsTool, handleListAdClients } from './list-ad-clients.js';
import { listAdUnitsTool, handleListAdUnits } from './list-ad-units.js';
import { listPaymentsTool, handleListPayments } from './list-payments.js';
import { generateReportTool, handleGenerateReport } from './generate-report.js';

export const adsenseTools = [
  listAccountsTool,
  getAccountTool,
  listAdClientsTool,
  listAdUnitsTool,
  listPaymentsTool,
  generateReportTool,
];

export const adsenseHandlers: Record<string, (args: unknown) => Promise<unknown>> = {
  adsense_list_accounts: handleListAccounts,
  adsense_get_account: handleGetAccount,
  adsense_list_ad_clients: handleListAdClients,
  adsense_list_ad_units: handleListAdUnits,
  adsense_list_payments: handleListPayments,
  adsense_generate_report: handleGenerateReport,
};
