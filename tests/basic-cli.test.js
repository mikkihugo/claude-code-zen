#!/usr/bin/env node

/**
 * Basic CLI Test Suite
 * 
 * Tests to verify that the Claude Zen CLI is functional after fixes.
 * This demonstrates the improvement from broken to working state.
 */

import { execSync } from 'child_process';

const CLI_PATH = './src/cli/claude-zen-hive-mind.js';

// Run tests if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  console.log('🧪 Running basic CLI tests...');
  
  try {
    // Test version command
    console.log('Testing version command...');
    const versionResult = execSync(`node ${CLI_PATH} --version`, { encoding: 'utf8' });
    console.log('✅ Version command works');
    
    // Test help command  
    console.log('Testing help command...');
    const helpResult = execSync(`node ${CLI_PATH} --help`, { encoding: 'utf8' });
    console.log('✅ Help command works');
    
    // Test status command
    console.log('Testing status command...');
    const statusResult = execSync(`node ${CLI_PATH} status`, { encoding: 'utf8' });
    console.log('✅ Status command works');
    
    console.log('\n🎉 All basic CLI tests passed!');
    console.log('🚀 Claude Zen CLI is now functional with mock ruv-FANN integration');
    
  } catch (error) {
    console.error('❌ CLI tests failed:', error.message);
    process.exit(1);
  }
}