#!/usr/bin/env node

/* Debug server to isolate the port binding issue */

import { createServer } from 'node:http';
import express from 'express';

async function debugServer() {
  console.warn('🔧 Starting debug server...');
  try {
    const app = express();

    app.get('/health', (_req, res) =>
      res.json({ status: 'healthy', timestamp: new Date().toISOString() }));

    app.get('/', (_req, res) =>
      res.send('<h1>Debug Server Working</h1><p>Port binding test successful</p>'));

    const server = createServer(app);

    server.listen(3000, '0.0.0.0', () => {
      console.warn('✅ Debug server listening on port 3000');
      console.warn('🌐 Test: http://localhost:3000');
    });

    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start debug server:', error);
    process.exit(1);
  }
}

debugServer();
