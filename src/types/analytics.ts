import { z } from 'zod';

// Account schemas
export const ListAccountsInputSchema = z.object({}).strict();

export const ListPropertiesInputSchema = z
  .object({
    accountId: z.string().describe('GA4 account ID (e.g., "accounts/123456")'),
  })
  .strict();

export const CreatePropertyInputSchema = z
  .object({
    accountId: z.string().describe('GA4 account ID (e.g., "accounts/123456")'),
    displayName: z.string().describe('Display name for the property'),
    timeZone: z.string().describe('Time zone (e.g., "Europe/Prague")'),
    currencyCode: z.string().describe('Currency code (e.g., "CZK", "USD")'),
    industryCategory: z
      .string()
      .optional()
      .describe('Industry category (e.g., "AUTOMOTIVE", "FINANCE")'),
  })
  .strict();

export const GetPropertyInputSchema = z
  .object({
    propertyId: z.string().describe('GA4 property ID (e.g., "properties/123456789")'),
  })
  .strict();

export const UpdatePropertyInputSchema = z
  .object({
    propertyId: z.string().describe('GA4 property ID (e.g., "properties/123456789")'),
    displayName: z.string().optional().describe('New display name'),
    timeZone: z.string().optional().describe('New time zone'),
    currencyCode: z.string().optional().describe('New currency code'),
  })
  .strict();

export const DeletePropertyInputSchema = z
  .object({
    propertyId: z.string().describe('GA4 property ID (e.g., "properties/123456789")'),
  })
  .strict();

// Data stream schemas
export const ListDataStreamsInputSchema = z
  .object({
    propertyId: z.string().describe('GA4 property ID (e.g., "properties/123456789")'),
  })
  .strict();

export const CreateWebStreamInputSchema = z
  .object({
    propertyId: z.string().describe('GA4 property ID (e.g., "properties/123456789")'),
    displayName: z.string().describe('Display name for the stream'),
    defaultUri: z.string().describe('Default URI (e.g., "https://example.com")'),
  })
  .strict();

export const CreateAppStreamInputSchema = z
  .object({
    propertyId: z.string().describe('GA4 property ID (e.g., "properties/123456789")'),
    displayName: z.string().describe('Display name for the stream'),
    packageName: z.string().describe('iOS bundle ID or Android package name'),
    platform: z.enum(['IOS', 'ANDROID']).describe('Platform type'),
  })
  .strict();

export const UpdateDataStreamInputSchema = z
  .object({
    streamId: z.string().describe('Full stream ID (e.g., "properties/123/dataStreams/456")'),
    displayName: z.string().optional().describe('New display name'),
  })
  .strict();

export const GetMeasurementIdInputSchema = z
  .object({
    streamId: z.string().describe('Full stream ID (e.g., "properties/123/dataStreams/456")'),
  })
  .strict();

// Events & Conversions schemas
export const ListConversionEventsInputSchema = z
  .object({
    propertyId: z.string().describe('GA4 property ID (e.g., "properties/123456789")'),
  })
  .strict();

export const CreateConversionEventInputSchema = z
  .object({
    propertyId: z.string().describe('GA4 property ID (e.g., "properties/123456789")'),
    eventName: z.string().describe('Event name to mark as conversion'),
  })
  .strict();

export const DeleteConversionEventInputSchema = z
  .object({
    propertyId: z.string().describe('GA4 property ID (e.g., "properties/123456789")'),
    eventName: z.string().describe('Event name to unmark as conversion'),
  })
  .strict();

// Reporting schemas
export const GetRealtimeInputSchema = z
  .object({
    propertyId: z.string().describe('GA4 property ID (e.g., "properties/123456789")'),
    dimensions: z
      .array(z.string())
      .optional()
      .describe('Dimensions (e.g., ["country", "city", "deviceCategory"])'),
    metrics: z
      .array(z.string())
      .optional()
      .describe('Metrics (e.g., ["activeUsers", "screenPageViews"])'),
  })
  .strict();

export const RunReportInputSchema = z
  .object({
    propertyId: z.string().describe('GA4 property ID (e.g., "properties/123456789")'),
    dateRanges: z
      .array(
        z.object({
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .describe('Date ranges for the report'),
    dimensions: z.array(z.string()).describe('Dimensions (e.g., ["date", "country"])'),
    metrics: z.array(z.string()).describe('Metrics (e.g., ["sessions", "totalUsers"])'),
    limit: z.number().optional().describe('Maximum rows to return'),
    offset: z.number().optional().describe('Row offset for pagination'),
  })
  .strict();

export const RunPivotReportInputSchema = z
  .object({
    propertyId: z.string().describe('GA4 property ID (e.g., "properties/123456789")'),
    dateRanges: z
      .array(
        z.object({
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .describe('Date ranges for the report'),
    dimensions: z.array(z.string()).describe('Dimensions'),
    metrics: z.array(z.string()).describe('Metrics'),
    pivots: z
      .array(
        z.object({
          fieldNames: z.array(z.string()),
          limit: z.number().optional(),
        })
      )
      .describe('Pivot configurations'),
  })
  .strict();

export const BatchRunReportsInputSchema = z
  .object({
    propertyId: z.string().describe('GA4 property ID (e.g., "properties/123456789")'),
    requests: z
      .array(
        z.object({
          dateRanges: z.array(
            z.object({
              startDate: z.string(),
              endDate: z.string(),
            })
          ),
          dimensions: z.array(z.string()),
          metrics: z.array(z.string()),
        })
      )
      .describe('Array of report requests'),
  })
  .strict();

// Custom dimensions/metrics schemas
export const ListCustomDimensionsInputSchema = z
  .object({
    propertyId: z.string().describe('GA4 property ID (e.g., "properties/123456789")'),
  })
  .strict();

export const CreateCustomDimensionInputSchema = z
  .object({
    propertyId: z.string().describe('GA4 property ID (e.g., "properties/123456789")'),
    parameterName: z.string().describe('Event parameter name'),
    displayName: z.string().describe('Display name'),
    scope: z.enum(['EVENT', 'USER', 'ITEM']).describe('Dimension scope'),
    description: z.string().optional().describe('Description'),
  })
  .strict();

export const ListCustomMetricsInputSchema = z
  .object({
    propertyId: z.string().describe('GA4 property ID (e.g., "properties/123456789")'),
  })
  .strict();

export const CreateCustomMetricInputSchema = z
  .object({
    propertyId: z.string().describe('GA4 property ID (e.g., "properties/123456789")'),
    parameterName: z.string().describe('Event parameter name'),
    displayName: z.string().describe('Display name'),
    measurementUnit: z
      .enum([
        'STANDARD',
        'CURRENCY',
        'FEET',
        'METERS',
        'KILOMETERS',
        'MILES',
        'MILLISECONDS',
        'SECONDS',
        'MINUTES',
        'HOURS',
      ])
      .describe('Measurement unit'),
    scope: z.literal('EVENT').default('EVENT').describe('Metric scope (always EVENT)'),
    description: z.string().optional().describe('Description'),
  })
  .strict();
