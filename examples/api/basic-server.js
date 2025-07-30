/** Basic Claude Zen Server Setup Example */
/** Demonstrates how to start the schema-driven API server */

import { CLAUDE_ZEN_SCHEMA } from '../../src/api/claude-zen-schema.js';
import { ClaudeZenServer } from '../../src/api/claude-zen-server.js';

async function basicServerExample() {
  console.warn('🚀 Starting Basic Claude Zen Server Example');

  // Create server instance with configuration
  const server = new ClaudeZenServer({
    port: 3000,
    host: '0.0.0.0',
    schema: CLAUDE_ZEN_SCHEMA,
  });

  try {
    // Start the server
    await server.start();
    console.warn('✅ Server started successfully');
    console.warn(`📡 API available at http://localhost:3000`);
    console.warn(`📚 API docs available at http://localhost:3000/docs`);

    // Log available endpoints
    console.warn('\n📋 Available Endpoints:');
    server.generatedRoutes.forEach((route) => {
      console.warn(`${route.method.toUpperCase()} ${route.path} - ${route.description}`);
    });

    // Example API calls
    console.warn('\n🔄 Making example API calls...');

    // Get visions
    const visionsResponse = await fetch('http://localhost:3000/api/visions');
    const visions = await visionsResponse.json();
    console.warn('Visions:', visions);

    // Get ADRs
    const adrsResponse = await fetch('http://localhost:3000/api/adrs');
    const adrs = await adrsResponse.json();
    console.warn('ADRs:', adrs);

    // Keep server running for demonstration
    console.warn('\n🏃 Server running... Press Ctrl+C to stop');

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      console.warn('\n🛑 Shutting down server...');
      await server.stop();
      console.warn('✅ Server stopped');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

// Example with custom middleware
async function advancedServerExample() {
  console.warn('🚀 Starting Advanced Claude Zen Server Example');

  const server = new ClaudeZenServer({
    port: 3000,
    host: '0.0.0.0',
    schema: CLAUDE_ZEN_SCHEMA,
  });

  // Add custom middleware
  server.app.use('/api/custom', (req, res, next) => {
    console.warn(`Custom middleware: ${req.method} ${req.path}`);
    next();
  });

  // Add custom routes
  server.app.get('/api/custom/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  });

  // Monitor server events
  server.on('request', (data) => {
    console.warn(`📥 Request: ${data.method} ${data.path}`);
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error);
  });

  try {
    await server.start();
    console.warn('✅ Advanced server started');
    console.warn(`🏥 Custom health endpoint: http://localhost:3000/api/custom/health`);
  } catch (error) {
    console.error('❌ Advanced server startup failed:', error);
    process.exit(1);
  }
}

// Run examples
if (import.meta.url === `file://${process.argv[1]}`) {
  const example = process.argv[2] ?? 'basic';

  if (example === 'basic') {
    basicServerExample();
  } else if (example === 'advanced') {
    advancedServerExample();
  } else {
    console.warn('Usage: node basic-server.js [basic|advanced]');
  }
}

export { basicServerExample, advancedServerExample };
