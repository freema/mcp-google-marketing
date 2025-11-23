#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { validateAuth, isAuthComplete } from './utils/google-auth.js';
import { performOAuthFlow } from './utils/oauth-flow.js';
import { getTokensFilePath } from './utils/token-storage.js';
import { allTools, allHandlers } from './tools/index.js';

const SERVER_NAME = 'mcp-google-marketing';
const SERVER_VERSION = '1.0.0';

async function main() {
  // Validate OAuth credentials are configured
  try {
    validateAuth();
  } catch (error) {
    console.error(
      'Authentication validation failed:',
      error instanceof Error ? error.message : error
    );
    console.error('\nPlease configure OAuth credentials before starting the server.');
    process.exit(1);
  }

  // Check if OAuth tokens exist, run OAuth flow if not
  const authComplete = await isAuthComplete();
  if (!authComplete) {
    console.error('\n========================================');
    console.error('First-time setup required');
    console.error('========================================\n');
    console.error('No OAuth tokens found. Starting authorization flow...\n');

    try {
      await performOAuthFlow();
      console.error('OAuth setup complete!');
      console.error(`Tokens saved to: ${getTokensFilePath()}\n`);
    } catch (error) {
      console.error('OAuth setup failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle list tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools,
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const handler = allHandlers[name];
    if (!handler) {
      return {
        content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }],
        isError: true,
      };
    }

    try {
      const result = await handler(args || {});
      return {
        content: result.content,
        isError: result.isError,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{ type: 'text' as const, text: `Tool execution failed: ${message}` }],
        isError: true,
      };
    }
  });

  // Handle errors
  server.onerror = (error) => {
    console.error('[MCP Error]', error);
  };

  // Handle close
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.close();
    process.exit(0);
  });

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`${SERVER_NAME} v${SERVER_VERSION} started`);
  console.error(`Loaded ${allTools.length} tools`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
