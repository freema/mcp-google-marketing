import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolResponse } from '../../types/common.js';

// Management tools
import { listAccountsTool, handleListAccounts } from './list-accounts.js';
import { listPropertiesTool, handleListProperties } from './list-properties.js';
import { createPropertyTool, handleCreateProperty } from './create-property.js';
import { getPropertyTool, handleGetProperty } from './get-property.js';
import { updatePropertyTool, handleUpdateProperty } from './update-property.js';
import { deletePropertyTool, handleDeleteProperty } from './delete-property.js';

// Data streams tools
import { listDataStreamsTool, handleListDataStreams } from './list-data-streams.js';
import { createWebStreamTool, handleCreateWebStream } from './create-web-stream.js';
import { createAppStreamTool, handleCreateAppStream } from './create-app-stream.js';
import { updateDataStreamTool, handleUpdateDataStream } from './update-data-stream.js';
import { getMeasurementIdTool, handleGetMeasurementId } from './get-measurement-id.js';

// Conversion tools
import { listConversionEventsTool, handleListConversionEvents } from './list-conversion-events.js';
import {
  createConversionEventTool,
  handleCreateConversionEvent,
} from './create-conversion-event.js';
import {
  deleteConversionEventTool,
  handleDeleteConversionEvent,
} from './delete-conversion-event.js';

// Reporting tools
import { getRealtimeTool, handleGetRealtime } from './get-realtime.js';
import { runReportTool, handleRunReport } from './run-report.js';
import { runPivotReportTool, handleRunPivotReport } from './run-pivot-report.js';
import { batchRunReportsTool, handleBatchRunReports } from './batch-run-reports.js';

// Custom dimensions/metrics tools
import { listCustomDimensionsTool, handleListCustomDimensions } from './list-custom-dimensions.js';
import {
  createCustomDimensionTool,
  handleCreateCustomDimension,
} from './create-custom-dimension.js';
import { listCustomMetricsTool, handleListCustomMetrics } from './list-custom-metrics.js';
import { createCustomMetricTool, handleCreateCustomMetric } from './create-custom-metric.js';

export const tools: Tool[] = [
  // Management
  listAccountsTool,
  listPropertiesTool,
  createPropertyTool,
  getPropertyTool,
  updatePropertyTool,
  deletePropertyTool,
  // Data streams
  listDataStreamsTool,
  createWebStreamTool,
  createAppStreamTool,
  updateDataStreamTool,
  getMeasurementIdTool,
  // Conversions
  listConversionEventsTool,
  createConversionEventTool,
  deleteConversionEventTool,
  // Reporting
  getRealtimeTool,
  runReportTool,
  runPivotReportTool,
  batchRunReportsTool,
  // Custom dimensions/metrics
  listCustomDimensionsTool,
  createCustomDimensionTool,
  listCustomMetricsTool,
  createCustomMetricTool,
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handlers: Record<string, (args: any) => Promise<ToolResponse>> = {
  // Management
  ga4_list_accounts: handleListAccounts,
  ga4_list_properties: handleListProperties,
  ga4_create_property: handleCreateProperty,
  ga4_get_property: handleGetProperty,
  ga4_update_property: handleUpdateProperty,
  ga4_delete_property: handleDeleteProperty,
  // Data streams
  ga4_list_data_streams: handleListDataStreams,
  ga4_create_web_stream: handleCreateWebStream,
  ga4_create_app_stream: handleCreateAppStream,
  ga4_update_data_stream: handleUpdateDataStream,
  ga4_get_measurement_id: handleGetMeasurementId,
  // Conversions
  ga4_list_conversion_events: handleListConversionEvents,
  ga4_create_conversion_event: handleCreateConversionEvent,
  ga4_delete_conversion_event: handleDeleteConversionEvent,
  // Reporting
  ga4_get_realtime: handleGetRealtime,
  ga4_run_report: handleRunReport,
  ga4_run_pivot_report: handleRunPivotReport,
  ga4_batch_run_reports: handleBatchRunReports,
  // Custom dimensions/metrics
  ga4_list_custom_dimensions: handleListCustomDimensions,
  ga4_create_custom_dimension: handleCreateCustomDimension,
  ga4_list_custom_metrics: handleListCustomMetrics,
  ga4_create_custom_metric: handleCreateCustomMetric,
};
