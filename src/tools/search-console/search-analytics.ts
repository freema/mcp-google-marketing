import { z } from 'zod';
import { getSearchConsoleClient } from '../../utils/google-auth.js';
import { SearchAnalyticsInputSchema } from '../../types/search-console.js';
import { createToolResponse, createErrorResponse, ToolResponse } from '../../types/common.js';

export const searchAnalyticsTool = {
  name: 'gsc_search_analytics',
  description: 'Query search analytics data from Google Search Console (impressions, clicks, CTR, position)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      siteUrl: {
        type: 'string',
        description: 'Site URL',
      },
      startDate: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD)',
      },
      endDate: {
        type: 'string',
        description: 'End date (YYYY-MM-DD)',
      },
      dimensions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Dimensions to group by (country, device, page, query, searchAppearance, date)',
      },
      type: {
        type: 'string',
        description: 'Search type filter (web, image, video, news, discover, googleNews)',
      },
      dimensionFilterGroups: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            groupType: { type: 'string' },
            filters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  dimension: { type: 'string' },
                  operator: { type: 'string' },
                  expression: { type: 'string' },
                },
              },
            },
          },
        },
        description: 'Filter groups for query',
      },
      aggregationType: {
        type: 'string',
        description: 'How to aggregate data (auto, byPage, byProperty)',
      },
      rowLimit: {
        type: 'number',
        description: 'Maximum rows to return (default 1000, max 25000)',
      },
      startRow: {
        type: 'number',
        description: 'Row offset for pagination',
      },
      dataState: {
        type: 'string',
        description: 'Data freshness (all includes fresh data, final for finalized data)',
      },
    },
    required: ['siteUrl', 'startDate', 'endDate'],
  },
};

export async function handleSearchAnalytics(
  args: z.infer<typeof SearchAnalyticsInputSchema>
): Promise<ToolResponse> {
  try {
    const {
      siteUrl,
      startDate,
      endDate,
      dimensions,
      type,
      dimensionFilterGroups,
      aggregationType,
      rowLimit,
      startRow,
      dataState,
    } = SearchAnalyticsInputSchema.parse(args);

    const client = await getSearchConsoleClient();

    const requestBody: {
      startDate: string;
      endDate: string;
      dimensions?: string[];
      type?: string;
      dimensionFilterGroups?: Array<{
        groupType?: string;
        filters: Array<{
          dimension: string;
          operator: string;
          expression: string;
        }>;
      }>;
      aggregationType?: string;
      rowLimit?: number;
      startRow?: number;
      dataState?: string;
    } = {
      startDate,
      endDate,
    };

    if (dimensions) {
      requestBody.dimensions = dimensions;
    }
    if (type) {
      requestBody.type = type;
    }
    if (dimensionFilterGroups) {
      requestBody.dimensionFilterGroups = dimensionFilterGroups;
    }
    if (aggregationType) {
      requestBody.aggregationType = aggregationType;
    }
    if (rowLimit !== undefined) {
      requestBody.rowLimit = rowLimit;
    }
    if (startRow !== undefined) {
      requestBody.startRow = startRow;
    }
    if (dataState) {
      requestBody.dataState = dataState;
    }

    const response = await client.searchanalytics.query({
      siteUrl,
      requestBody,
    });

    const rows = (response.data.rows || []).map((row) => ({
      keys: row.keys,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }));

    return createToolResponse({
      rowCount: rows.length,
      rows,
      responseAggregationType: response.data.responseAggregationType,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to query search analytics: ${message}`);
  }
}
