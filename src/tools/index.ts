import { ToolResponse } from '../types/common.js';

// Import tools and handlers from each service
import { tools as analyticsTools, handlers as analyticsHandlers } from './analytics/index.js';
import { tools as searchConsoleTools, handlers as searchConsoleHandlers } from './search-console/index.js';
import { adsenseTools, adsenseHandlers } from './adsense/index.js';

// Combine all tools
export const allTools = [
  ...analyticsTools,
  ...searchConsoleTools,
  ...adsenseTools,
];

// Combine all handlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const allHandlers: Record<string, (args: any) => Promise<ToolResponse>> = {
  ...analyticsHandlers,
  ...searchConsoleHandlers,
  ...adsenseHandlers,
};

// Re-export analytics
export {
  tools as analyticsTools,
  handlers as analyticsHandlers,
} from './analytics/index.js';

// Re-export search console
export {
  tools as searchConsoleTools,
  handlers as searchConsoleHandlers,
} from './search-console/index.js';

// Re-export adsense
export { adsenseTools, adsenseHandlers } from './adsense/index.js';
