import { z } from 'zod';

export const DateRangeSchema = z.object({
  startDate: z.string().describe('Start date (YYYY-MM-DD or relative like "30daysAgo")'),
  endDate: z.string().describe('End date (YYYY-MM-DD or relative like "today")'),
});

export type DateRange = z.infer<typeof DateRangeSchema>;

export interface ToolResponse {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

export function createToolResponse(data: unknown): ToolResponse {
  return {
    content: [{ type: 'text', text: JSON.stringify(data) }],
  };
}

export function createErrorResponse(message: string): ToolResponse {
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  };
}
