/** Server Examples */
/** Demonstrates how to use the TypeScript server implementations */

import {
  authenticate,
  authorize,
  corsMiddleware,
  rateLimiter,
  requestLogger,
} from '../src/middleware/index.js';
import {
  createAPIServer,
  createMCPServer,
  createServerBuilder,
  createUnifiedServer,
  serverFactory,
} from '../src/server-factory.js';

async function basicServerExample() {
  console.warn('🚀 Basic Server Example');

  const config = {
    port: 3000,
    host: 'localhost',
    middleware: [],
  };

  const server = await createAPIServer(config);
  console.warn('✅ Server created successfully');

  return server;
}

async function mcpServerExample() {
  console.warn('🔌 MCP Server Example');

  const mcpServer = await createMCPServer({
    name: 'example-mcp-server',
    version: '1.0.0',
  });

  console.warn('✅ MCP Server created successfully');
  return mcpServer;
}

async function unifiedServerExample() {
  console.warn('⚡ Unified Server Example');

  const unifiedServer = await createUnifiedServer({
    api: { port: 3000 },
    mcp: { name: 'unified-mcp' },
  });

  console.warn('✅ Unified Server created successfully');
  return unifiedServer;
}

// Run examples
async function runExamples() {
  try {
    await basicServerExample();
    await mcpServerExample();
    await unifiedServerExample();
    console.warn('🎉 All server examples completed!');
  } catch (error) {
    console.error('❌ Server examples failed:', error);
  }
}

export {
  basicServerExample,
  mcpServerExample,
  unifiedServerExample,
  runExamples,
};
