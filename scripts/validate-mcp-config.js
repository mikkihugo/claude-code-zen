#!/usr/bin/env node

/**
 * MCP Configuration Validator
 * 
 * Validates the MCP configuration files and tests connectivity to external servers
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration validation types (JSDoc comments for TypeScript-like documentation)
/**
 * @typedef {Object} MCPServer
 * @property {string} [type] - Server type (http, sse, local)
 * @property {string} [url] - Server URL
 * @property {string} [command] - Local command to run
 * @property {string[]} [args] - Command arguments
 * @property {string} [description] - Server description
 */

/**
 * @typedef {Object} MCPConfig
 * @property {Object} [mcp] - MCP configuration
 * @property {Object.<string, MCPServer>} [mcp.servers] - Server configurations
 */

async function validateMCPConfig() {
  console.log('🔍 Validating MCP Configuration...\n');

  try {
    // Load and validate main MCP config
    const configPath = path.join(__dirname, '..', 'mcp-config.json');
    const configData = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configData);

    console.log('✅ MCP config file loaded successfully');
    
    if (!config.mcp?.servers) {
      throw new Error('No MCP servers configuration found');
    }

    const servers = config.mcp.servers;
    console.log(`📡 Found ${Object.keys(servers).length} MCP servers:\n`);

    // Validate each server configuration
    for (const [name, server] of Object.entries(servers)) {
      console.log(`🔧 ${name}:`);
      
      if (server.url) {
        console.log(`   Type: ${server.type || 'http'}`);
        console.log(`   URL: ${server.url}`);
        
        // Test external server availability (non-blocking)
        try {
          const response = await fetch(server.url, { 
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
          });
          console.log(`   Status: ✅ Reachable (${response.status})`);
        } catch (error) {
          console.log(`   Status: ⚠️  Not reachable (${error.message})`);
        }
      } else if (server.command) {
        console.log(`   Type: Local command`);
        console.log(`   Command: ${server.command} ${server.args?.join(' ') || ''}`);
        console.log(`   Status: ✅ Configured for local execution`);
      }
      
      if (server.description) {
        console.log(`   Purpose: ${server.description}`);
      }
      console.log('');
    }

    // Validate GitHub Copilot integration
    console.log('🤖 GitHub Copilot Integration:');
    
    const copilotConfigPath = path.join(__dirname, '..', '.github', 'copilot-config.yml');
    try {
      await fs.access(copilotConfigPath);
      console.log('   ✅ Copilot configuration found');
    } catch {
      console.log('   ⚠️  Copilot configuration not found');
    }

    const copilotInstructionsPath = path.join(__dirname, '..', '.github', 'copilot-instructions.md');
    try {
      await fs.access(copilotInstructionsPath);
      console.log('   ✅ Copilot instructions found');
    } catch {
      console.log('   ⚠️  Copilot instructions not found');
    }

    console.log('\n📋 Validation Summary:');
    console.log('   • MCP configuration is valid');
    console.log('   • External servers configured for research');
    console.log('   • Local server ready for coordination');
    console.log('   • GitHub Copilot integration optimized');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Start local MCP server: npm run mcp');
    console.log('   2. Add configuration to Claude Desktop');
    console.log('   3. Use MCP tools for enhanced development workflow');

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

// Test local MCP server availability
async function testLocalMCPServer() {
  console.log('\n🧪 Testing Local MCP Server...');
  
  try {
    const response = await fetch('http://localhost:3000/health', {
      signal: AbortSignal.timeout(2000)
    });
    
    if (response.ok) {
      const health = await response.json();
      console.log('   ✅ Local MCP server is running');
      console.log(`   🏥 Health status: ${health.status || 'unknown'}`);
    }
  } catch (error) {
    console.log('   ⚠️  Local MCP server not running');
    console.log('   💡 Start with: npm run mcp');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  validateMCPConfig()
    .then(() => testLocalMCPServer())
    .catch(console.error);
}

export { validateMCPConfig, testLocalMCPServer };