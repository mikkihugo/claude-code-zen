#!/usr/bin/env node

import express from 'express';
import { CLAUDE_ZEN_SCHEMA } from './dist/api/claude-zen-schema.js';

console.warn('🔍 Testing each route individually...');
const app = express();

Object.entries(CLAUDE_ZEN_SCHEMA).forEach(([cmdName, cmdConfig]) => {
  if (!cmdName.startsWith('__') && cmdConfig.interfaces?.web?.enabled) {
    const { endpoint, method } = cmdConfig.interfaces.web;
    const httpMethod = method.toLowerCase();
    console.warn(`Testing: ${method} ${endpoint} (${cmdName})`);
    try {
      app[httpMethod](endpoint, (_req, res) => res.json({ status: 'ok', command: cmdName }));
    } catch (error) {
      console.error(`Error setting up route ${endpoint}:`, error);
    }
  }
});

const port = 3001;
app.listen(port, () => {
  console.warn(`✅ Debug routes server running on port ${port}`);
  console.warn('Test each route manually or use automated tests');
});
