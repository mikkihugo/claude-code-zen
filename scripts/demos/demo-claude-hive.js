#!/usr/bin/env node

/* Demo: Claude-powered Hive Mind in action */

import { printInfo, printSuccess, printWarning } from './src/cli/utils.js';

console.warn('🤖 Claude-Powered Hive Mind Demo\n');

printInfo('This demo shows Claude as primary AI for hive coordination.\n');

// Step 1: Create a simple hive task
printInfo('Step 1: Define a hive task\n');
const task = 'Create a simple TODO API with user authentication';

// Step 2: Show how Claude would handle it
printInfo('\nStep 2: Claude task breakdown\n');
try {
  // Use the Claude provider directly
  const { ClaudeCodeProvider } = await import('./src/cli/claude-code-provider.js');
  const provider = new ClaudeCodeProvider({
    customSystemPrompt: 'You are a hive mind coordinator'});

  if (await provider.isAvailable()) {
    printSuccess('✅ Claude is ready to coordinate!\n');

    // Get task breakdown
    const breakdown = await provider.generateForTask('expand-task', task);
    printInfo('Claude\'s task breakdown:\n');
    console.warn(`${breakdown.substring(0, 500)}...\n`);

    // Show agent delegation
    const agentPrompt = `Based on this task: '${task}', what specialized agents would you spawn and what would each do? Format as list.`;
    const agentPlan = await provider.generateText(agentPrompt);
    printInfo('Claude\'s agent delegation:\n');
    console.warn(`${agentPlan.substring(0, 500)}...\n`);

    printSuccess('🎉 Claude successfully coordinated the hive!\n');

    // Show the actual commands
    printInfo('Commands to try:\n');
    console.warn('');
    console.warn('  # Launch the hive');
    console.warn(`  claude-zen hive-mind launch "${task}"`);
    console.warn('  # Monitor progress');
    console.warn('  claude-zen hive-mind status');
    console.warn('  # View agent coordination');
    console.warn('  claude-zen swarm monitor');
  } else {
    printWarning('⚠️  Claude is not available. Please run setup first.');
  }
} catch (error) {
  printWarning(`Demo error: ${error.message}`);
  printInfo('\nMake sure Claude Code is installed and authenticated.');
}

console.warn('\n🚀 Claude + Hive Mind = Powerful AI-driven development!');
