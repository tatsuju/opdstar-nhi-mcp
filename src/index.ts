/**
 * @opdstar/nhi-mcp — Taiwan's first public NHI MCP Server
 * Powered by OPDSTAR (https://opdstar.com)
 *
 * Read-only MCP tools that let any MCP-compatible AI agent
 * (Claude Desktop, Cursor, etc.) query Taiwan's National Health Insurance
 * curated dataset.
 *
 * Tool registry + dispatcher lives in `./http-handler.ts` so the same
 * surface can be exposed over stdio (this entry) and over HTTPS JSON-RPC
 * (opdstar.com `/api/mcp` Vercel edge route).
 *
 * Runs over stdio. Invoke via `npx @opdstar/nhi-mcp`.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';

import { OpdstarClient } from './client.js';
import { VERSION } from './version.js';
import { TOOL_DEFS, callToolByName } from './http-handler.js';

const client = new OpdstarClient();

const server = new Server(
  {
    name: '@opdstar/nhi-mcp',
    version: VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOL_DEFS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;
  // SDK's CallToolResult is a discriminated union; the dispatcher returns the
  // legacy `{ content, isError? }` variant which is structurally compatible.
  return callToolByName(client, name, args) as never;
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stderr (stdout is reserved for MCP protocol frames)
  console.error(
    `[opdstar-nhi-mcp v${VERSION}] Ready. Powered by OPDSTAR (https://opdstar.com)`
  );
}

main().catch((err) => {
  console.error('[opdstar-nhi-mcp] Fatal error:', err);
  process.exit(1);
});
