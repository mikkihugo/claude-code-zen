#!/usr/bin/env node

/* Neural Architecture Advisor Example */
/** Demonstrates how the ArchitectAdvisor Queen uses neural networks to provide intelligent architectural recommendations */

import { ArchitectAdvisor } from '../src/queens/architect-advisor.js';
import { createQueenCoordinator } from '../src/queens/index.js';
import { Logger } from '../src/utils/logger.js';

const logger = new Logger('ArchitectureExample');

async function demonstrateArchitectureAnalysis() {
  console.warn('🧠 Neural Architecture Advisor Demo\n');
  console.warn('This example shows how neural networks enhance architectural decisions.\n');

  // Initialize the architect advisor
  const architect = new ArchitectAdvisor();

  // Test scenarios with varying complexity
  const scenarios = [
    {
      id: 'scenario-1',
      type: 'architecture-analysis',
      prompt: 'Design architecture for a startup MVP e-commerce platform with 3 developers, needs to launch in 6 weeks, expecting 1000 users initially',
      context: {
        budget: 'limited',
        team: 'small',
        timeline: 'aggressive'}},
    {
      id: 'scenario-2',
      type: 'architecture-analysis',
      prompt: 'Architecture for a high-traffic social media platform requiring real-time updates, handling 10M daily active users, with features like chat, feed, notifications, and video streaming',
      context: {
        scale: 'massive',
        requirements: {
          realTime: 0,
          highAvailability: true}}},
  ];

  // Process each scenario
  for (const scenario of scenarios) {
    console.warn(`\n${'='.repeat(80)}`);
    console.warn(`📋 Scenario: ${scenario.id}`);
    console.warn(`❓ Question: ${scenario.prompt}`);

    const result = await architect.process(scenario);
    console.warn(`🏗️ Recommended Architecture: ${result.recommendation.architecture}`);
    console.warn(`📊 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.warn(`🧠 Neural Contribution: ${(result.metadata.neuralContribution * 100).toFixed(1)}%`);
  }
}

// Run all demonstrations
async function runDemo() {
  try {
    await demonstrateArchitectureAnalysis();

    console.warn(`\n\n${'='.repeat(80)}`);
    console.warn('🎉 Neural Network Integration Demo Complete!\n');
    console.warn('Key Takeaways:');
    console.warn('1. Neural networks enhance decision-making with pattern recognition');
    console.warn('2. Fallback mechanisms ensure reliability when neural models are unavailable');
    console.warn('3. Caching improves performance for repeated queries');
    console.warn('4. Multiple queens can coordinate using neural insights');
    console.warn('5. The system learns and adapts over time\n');
  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Execute the demo
runDemo().catch(console.error);
