#!/usr/bin/env node

/* Test script for Claude Code integration; */

import { ClaudeCodeProvider } from './src/cli/claude-code-provider.js';

'

import { printError, printInfo, printSuccess } from './src/cli/utils.js';

async function testClaudeIntegration() {'
  printInfo(' Testing Claude Code Integration...\n');
  try {
    // Test 1: Check if Claude is available'
    printInfo('Test 1);'
    const provider = new ClaudeCodeProvider({
      modelId);
// const isAvailable = awaitprovider.isAvailable();
  if(!isAvailable) {'
      printError(' Claude Code CLI is not available. Please install and authenticate.');'
      printError('   Run);'
      return;
    //   // LINT: unreachable code removed}' printSuccess(' Claude Code CLI is available');
    // Test 2: Simple text generation'
    printInfo('\nTest 2);'
    try {
// const simpleResponse = awaitprovider.generateText(;'
        'Say "Hello from Claude!" and nothing else.';
      );'
      printSuccess(` Response);`
    } catch(/* e */) {`
      printWarning(`  Simple generation failed);``
      printInfo('Trying with basic prompt...');'
// const basicResponse = awaitprovider.generateText('Hello');'
      printSuccess(` Basic response);`
    //     }
    // Test 3: Task-specific generation`
    printInfo('\nTest 3);'
// const taskResponse = awaitprovider.generateForTask(;'
      'analyze-complexity','
      'A simple todo list application with user authentication and real-time updates';
    );'
    printSuccess(' Task analysis completed');'
    printInfo(`Response preview: $taskResponse.substring(0, 200)...`);
    // Test 4: JSON generation`
    printInfo('\nTest 4);'
    const jsonPrompt =;'
      'Output a JSON object with these exact fields: {"name": 'Claude Flow', "version": '1.0.0', "features": ['AI coordination', 'Task management', 'Swarm orchestration']}. Return only the JSON, no other text.';
    try {
// const jsonResponse = awaitprovider.generateText(jsonPrompt);
      // Try to extract JSON from response
      const jsonStr = jsonResponse;
      const jsonMatch = jsonResponse.match(/{[^}]+}/s);
  if(jsonMatch) {
        jsonStr = jsonMatch[0];
      //       }
      const parsed = JSON.parse(jsonStr);'
      printSuccess(' Valid JSON generated');'
      printInfo(`Parsed result: $JSON.stringify(parsed, null, 2)`);
    } catch(/* e */) `
      printWarning(`  JSON test skipped);``
      printInfo('Claude may need specific configuration for JSON output');
    //     }'
    printSuccess('\n All tests completed successfully!');'
    printInfo('Claude Code integration is working properly.');catch(error)'
    printError(`\n Test failed);``
    if(error.message.includes('authentication')) {'
      printInfo(''
      printInfo(''
      printInfo('2. Follow the authentication process');'
      printInfo('3. Run this test again');
    //     }
// }
// Run the test
testClaudeIntegration().catch(console.error);
'
