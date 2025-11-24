#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { validateAuth, isAuthComplete } from './utils/google-auth.js';
import { performOAuthFlow } from './utils/oauth-flow.js';
import { getTokensFilePath, deleteTokens, loadTokens } from './utils/token-storage.js';
import { allTools, allHandlers } from './tools/index.js';

const SERVER_NAME = 'mcp-google-marketing';
const SERVER_VERSION = '1.0.2';

/**
 * Handle CLI commands (auth, auth --status, auth --logout)
 */
async function handleCLI(args: string[]): Promise<boolean> {
  const command = args[0];

  if (command === 'auth') {
    const subCommand = args[1];

    if (subCommand === '--status') {
      // Check auth status
      console.log('\n========================================');
      console.log('OAuth Status');
      console.log('========================================\n');

      try {
        validateAuth();
        console.log('✓ OAuth credentials configured (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)');
      } catch {
        console.log('✗ OAuth credentials NOT configured');
        console.log('  Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables');
        return true;
      }

      const tokens = await loadTokens();
      if (tokens) {
        console.log('✓ OAuth tokens found');
        console.log(`  Token file: ${getTokensFilePath()}`);
        console.log(`  Has refresh token: ${tokens.refresh_token ? 'Yes' : 'No'}`);
        if (tokens.expiry_date) {
          const expiry = new Date(tokens.expiry_date);
          const isExpired = expiry < new Date();
          console.log(
            `  Access token expires: ${expiry.toISOString()} ${isExpired ? '(EXPIRED - will auto-refresh)' : ''}`
          );
        }
      } else {
        console.log('✗ OAuth tokens NOT found');
        console.log('  Run: npx mcp-google-marketing auth');
      }

      console.log('');
      return true;
    }

    if (subCommand === '--logout') {
      // Delete tokens
      console.log('\n========================================');
      console.log('Logout');
      console.log('========================================\n');

      await deleteTokens();
      console.log('✓ OAuth tokens deleted');
      console.log('  To re-authenticate, run: npx mcp-google-marketing auth\n');
      return true;
    }

    // Default: run OAuth flow
    console.log('\n========================================');
    console.log('OAuth Authentication');
    console.log('========================================\n');

    // Check if credentials are configured
    try {
      validateAuth();
    } catch (error) {
      console.error('✗ OAuth credentials not configured\n');
      console.error('Please set environment variables:');
      console.error('  export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"');
      console.error('  export GOOGLE_CLIENT_SECRET="your-client-secret"\n');
      console.error('Or create a .env file with these values.\n');
      process.exit(1);
    }

    // Check if already authenticated
    const authComplete = await isAuthComplete();
    if (authComplete) {
      console.log('✓ Already authenticated!\n');
      console.log('To re-authenticate, first logout:');
      console.log('  npx mcp-google-marketing auth --logout');
      console.log('  npx mcp-google-marketing auth\n');
      return true;
    }

    // Run OAuth flow
    console.log('Starting OAuth flow...\n');

    try {
      await performOAuthFlow();
      console.log('\n✓ Authentication successful!');
      console.log(`  Tokens saved to: ${getTokensFilePath()}\n`);
      console.log('You can now use the MCP server with Claude Code:\n');
      console.log('  claude mcp add google-marketing npx mcp-google-marketing \\');
      console.log('    --env GOOGLE_CLIENT_ID=your-client-id \\');
      console.log('    --env GOOGLE_CLIENT_SECRET=your-client-secret\n');
    } catch (error) {
      console.error('\n✗ Authentication failed:', error instanceof Error ? error.message : error);
      console.error('\nTroubleshooting:');
      console.error('  1. Make sure no other process is using port 8085');
      console.error('  2. Check your OAuth credentials are correct');
      console.error('  3. Make sure your email is added to test users (or publish the app)\n');
      process.exit(1);
    }

    return true;
  }

  if (command === '--help' || command === '-h') {
    console.log(`
${SERVER_NAME} v${SERVER_VERSION}

MCP server for Google Analytics 4, Search Console, and AdSense.

USAGE:
  npx mcp-google-marketing [command]

COMMANDS:
  (no command)      Start the MCP server (for Claude Code/Desktop)
  auth              Authenticate with Google OAuth
  auth --status     Check authentication status
  auth --logout     Remove stored OAuth tokens
  --help, -h        Show this help message

SETUP:
  1. Create OAuth credentials at https://console.cloud.google.com/
  2. Set environment variables:
     export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
     export GOOGLE_CLIENT_SECRET="your-client-secret"
  3. Authenticate:
     npx mcp-google-marketing auth
  4. Add to Claude Code:
     claude mcp add google-marketing npx mcp-google-marketing \\
       --env GOOGLE_CLIENT_ID=your-client-id \\
       --env GOOGLE_CLIENT_SECRET=your-client-secret

DOCUMENTATION:
  https://github.com/freema/mcp-google-marketing
`);
    return true;
  }

  return false;
}

/**
 * Create the auth_status tool definition
 */
const authStatusTool = {
  name: 'auth_status',
  description:
    'Check the authentication status of the Google Marketing MCP server. Use this to verify OAuth is configured correctly before using other tools.',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
};

/**
 * Handle the auth_status tool
 */
async function handleAuthStatus(): Promise<{
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}> {
  const lines: string[] = [];

  // Check credentials
  let credentialsOk = false;
  try {
    validateAuth();
    credentialsOk = true;
    lines.push('✓ OAuth credentials configured');
  } catch {
    lines.push('✗ OAuth credentials NOT configured');
    lines.push('  Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables');
  }

  // Check tokens
  if (credentialsOk) {
    const authComplete = await isAuthComplete();
    if (authComplete) {
      lines.push('✓ OAuth tokens valid');
      lines.push('');
      lines.push('Ready to use Google Marketing tools!');
    } else {
      lines.push('✗ OAuth tokens NOT found or invalid');
      lines.push('');
      lines.push('To authenticate, run this command in your terminal:');
      lines.push('  npx mcp-google-marketing auth');
      lines.push('');
      lines.push('Then restart Claude Code to reconnect the MCP server.');
      return {
        content: [{ type: 'text', text: lines.join('\n') }],
        isError: true,
      };
    }
  }

  return {
    content: [{ type: 'text', text: lines.join('\n') }],
    isError: !credentialsOk,
  };
}

/**
 * Start the MCP server
 */
async function startServer() {
  // Check OAuth credentials (required)
  try {
    validateAuth();
  } catch (error) {
    console.error('[ERROR] OAuth credentials not configured');
    console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables');
    process.exit(1);
  }

  // Check if authenticated (warning only, don't block)
  const authComplete = await isAuthComplete();
  if (!authComplete) {
    console.error('[WARNING] OAuth tokens not found');
    console.error('Run "npx mcp-google-marketing auth" to authenticate');
    console.error('Tools will return authentication errors until you authenticate.\n');
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

  // Include auth_status tool with all other tools
  const serverTools = [authStatusTool, ...allTools];

  // Handle list tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: serverTools,
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Handle auth_status tool
    if (name === 'auth_status') {
      return handleAuthStatus();
    }

    // Check authentication before running any other tool
    const isAuthenticated = await isAuthComplete();
    if (!isAuthenticated) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Authentication required!\n\nTo authenticate, run this command in your terminal:\n  npx mcp-google-marketing auth\n\nThen restart Claude Code to reconnect the MCP server.\n\nYou can check the status with the auth_status tool.`,
          },
        ],
        isError: true,
      };
    }

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
  console.error(`Loaded ${serverTools.length} tools (including auth_status)`);
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  // Handle CLI commands
  const handled = await handleCLI(args);
  if (handled) {
    return;
  }

  // No CLI command, start server
  await startServer();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
