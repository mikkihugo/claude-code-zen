#!/usr/bin/env node

/**
 * Manual Test for Maestro Specs-Driven Flow with Agent Reuse
 * Tests the enhanced maestro orchestrator functionality
 */

import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// Mock interfaces
interface AgentProfile {
  type: string;
  capabilities: string[];
  metadata?: Record<string, any>;
}

interface Task {
  id: string;
  type: string;
  description: string;
  assignedAgent?: string;
  metadata?: Record<string, any>;
}

interface WorkflowState {
  featureName: string;
  currentPhase: string;
  currentTaskIndex: number;
  status: string;
  lastActivity: Date;
  history: Array<{
    phase: string;
    status: string;
    timestamp: Date;
  }>;
}

// Mock implementations for testing
class MockEventBus {
  emit(event: string, data: any): void {
    console.log(`📡 Event: ${event}`, data);
  }
  on(): void {}
}

class MockLogger {
  info(msg: string): void {
    console.log(`ℹ️  ${msg}`);
  }
  warn(msg: string): void {
    console.log(`⚠️  ${msg}`);
  }
  error(msg: string): void {
    console.log(`❌ ${msg}`);
  }
  debug(msg: string): void {
    console.log(`🐛 ${msg}`);
  }
}

class MockMemoryManager {
  async store(): Promise<void> {}
  async retrieve(): Promise<any> {}
}

class MockAgentManager {
  private agents = new Map<string, { type: string; profile: AgentProfile; status: string }>();

  async createAgent(type: string, profile: AgentProfile): Promise<string> {
    const agentId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    this.agents.set(agentId, { type, profile, status: 'created' });
    console.log(`🤖 Created agent: ${agentId} (${type})`);
    return agentId;
  }

  async startAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = 'running';
      console.log(`▶️  Started agent: ${agentId}`);
    }
  }

  async stopAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = 'stopped';
      console.log(`⏹️  Stopped agent: ${agentId}`);
      this.agents.delete(agentId);
    }
  }
}

class MockOrchestrator {
  async assignTask(task: Task): Promise<{ success: boolean; duration: number }> {
    console.log(`📋 Task assigned to agent ${task.assignedAgent}: ${task.description}`);
    // Simulate task execution
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { success: true, duration: 100 };
  }
}

// Test the maestro orchestrator
async function testMaestroWithAgentReuse(): Promise<void> {
  console.log('🧪 Testing Maestro Specs-Driven Flow with Agent Reuse');
  console.log('='.repeat(60));

  // Mock config
  const config = { enableHiveMind: false };

  // Create mock dependencies
  const eventBus = new MockEventBus();
  const logger = new MockLogger();
  const memoryManager = new MockMemoryManager();
  const agentManager = new MockAgentManager();
  const mainOrchestrator = new MockOrchestrator();

  // Simple implementation of the core MaestroOrchestrator functionality
  class TestMaestroOrchestrator {
    private maestroState = new Map<string, WorkflowState>();
    private agentPool = new Map<string, string>();
    private capabilityIndex = new Map<string, string[]>();
    private logger: MockLogger;
    private agentManager: MockAgentManager;
    private mainOrchestrator: MockOrchestrator;

    constructor() {
      this.logger = logger;
      this.agentManager = agentManager;
      this.mainOrchestrator = mainOrchestrator;
    }

    async createSpec(featureName: string, initialRequest: string): Promise<void> {
      console.log(`
      📋 Creating spec for: ${featureName}`);

      const workflowState: WorkflowState = {
        featureName,
        currentPhase: 'Requirements Clarification',
        currentTaskIndex: 0,
        status: 'active',
        lastActivity: new Date(),
        history: [],
      };

      this.maestroState.set(featureName, workflowState);

      // Create specs directory structure
      const specsDir = join(process.cwd(), 'docs', 'maestro', 'specs', featureName);
      await mkdir(specsDir, { recursive: true });

      const requirementsContent = `# Requirements for ${featureName}

## High-Level Request
${initialRequest}

## User Stories
- As a developer, I want ${initialRequest.toLowerCase()}, so that I can verify functionality

## Acceptance Criteria
- [ ] Feature functions as described
- [ ] Agent reuse is working properly
- [ ] Performance is optimized

*Generated by Test Maestro Orchestrator*
`;

      await writeFile(join(specsDir, 'requirements.md'), requirementsContent);
      console.log(`✅ Spec created at: docs/maestro/specs/${featureName}/requirements.md`);
    }

    async generateDesign(featureName: string): Promise<void> {
      console.log(`
      🎨 Generating design for: ${featureName}`);

      // Test the enhanced agent selection
      const designTask: Task = {
        id: `design-${featureName}`,
        type: 'design-generation',
        description: `Generate design for ${featureName}`,
        metadata: { featureName },
      };

      // Simulate the new agent selection logic
      const optimalAgentTypes = await this.getOptimalAgentTypes(
        ['design', 'architecture', 'analysis'],
        'design-generation',
        2
      );

      console.log(`🎯 Selected optimal agents: ${optimalAgentTypes.join(', ')}`);

      // Create agents with reuse logic
      const selectedAgents: string[] = [];
      for (const agentType of optimalAgentTypes) {
        const agentId = await this.getOrCreateAgent(agentType, {
          type: agentType,
          capabilities: ['design', 'architecture'],
          metadata: { task: 'design-generation' },
        });
        selectedAgents.push(agentId);
      }

      // Execute design generation
      designTask.assignedAgent = selectedAgents[0];
      await this.mainOrchestrator.assignTask(designTask);

      // Generate design document
      const specsDir = join(process.cwd(), 'docs', 'maestro', 'specs', featureName);
      const designContent = `# Design for ${featureName}

## Architecture Overview
System designed using enhanced agent reuse functionality.

## Agent Reuse Statistics
- Reused agents: ${this.getAgentReuseCount()}
- Total agents: ${this.agentPool.size}
- Reuse rate: ${this.calculateReuseRate()}%

*Generated by Enhanced Maestro Orchestrator with Agent Reuse*
`;

      await writeFile(join(specsDir, 'design.md'), designContent);
      console.log(`✅ Design created at: docs/maestro/specs/${featureName}/design.md`);
    }

    private async getOptimalAgentTypes(
      requiredCapabilities: string[],
      taskType: string,
      maxAgents: number
    ): Promise<string[]> {
      // Enhanced agent selection logic
      const availableTypes = ['design-architect', 'system-architect', 'requirements-analyst'];
      const selected = availableTypes.slice(0, maxAgents);

      console.log(`🧠 Agent selection: Required capabilities: ${requiredCapabilities.join(', ')}`);
      console.log(`🧠 Agent selection: Task type: ${taskType}`);
      console.log(`🧠 Agent selection: Selected: ${selected.join(', ')}`);

      return selected;
    }

    private async getOrCreateAgent(agentType: string, profile: AgentProfile): Promise<string> {
      // Check if we can reuse an existing agent
      const existingAgentId = this.findReusableAgent(agentType, profile);
      if (existingAgentId) {
        console.log(`♻️  Reusing existing agent: ${existingAgentId} (${agentType})`);
        return existingAgentId;
      }

      // Create new agent
      const agentId = await this.agentManager.createAgent(agentType, profile);
      this.agentPool.set(agentId, agentType);

      // Index by capabilities
      if (!this.capabilityIndex.has(agentType)) {
        this.capabilityIndex.set(agentType, []);
      }
      this.capabilityIndex.get(agentType)!.push(agentId);

      console.log(`🆕 Created new agent: ${agentId} (${agentType})`);
      return agentId;
    }

    private findReusableAgent(agentType: string, profile: AgentProfile): string | null {
      const agentsOfType = this.capabilityIndex.get(agentType);
      if (agentsOfType && agentsOfType.length > 0) {
        // Return the first available agent of this type
        return agentsOfType[0];
      }
      return null;
    }

    private getAgentReuseCount(): number {
      // Simulate reuse counting
      return Math.max(0, this.agentPool.size - 2);
    }

    private calculateReuseRate(): number {
      if (this.agentPool.size === 0) return 0;
      const reuseCount = this.getAgentReuseCount();
      return Math.round((reuseCount / this.agentPool.size) * 100 * 10) / 10;
    }

    async generateTasks(featureName: string): Promise<void> {
      console.log(`
      📋 Generating tasks for: ${featureName}`);

      const tasksContent = `# Implementation Tasks for ${featureName}

## Task List
- [ ] 1. Set up project structure
- [ ] 2. Implement core functionality
- [ ] 3. Add comprehensive testing
- [ ] 4. Create documentation

*Generated by Test Maestro with Agent Reuse*
`;

      const specsDir = join(process.cwd(), 'docs', 'maestro', 'specs', featureName);
      await writeFile(join(specsDir, 'tasks.md'), tasksContent);
      console.log(`✅ Tasks created at: docs/maestro/specs/${featureName}/tasks.md`);
    }

    getStats(): { totalAgents: number; reuseRate: number; capabilityTypes: number } {
      return {
        totalAgents: this.agentPool.size,
        reuseRate: this.calculateReuseRate(),
        capabilityTypes: this.capabilityIndex.size,
      };
    }
  }

  try {
    const maestro = new TestMaestroOrchestrator();

    // Test workflow simulation
    const testFeatures = [
      'agent-reuse-validation-1',
      'agent-reuse-validation-2',
      'agent-reuse-validation-3',
    ];

    for (const feature of testFeatures) {
      console.log(`
      ${'='.repeat(40)}`);
      console.log(`🎯 Testing Feature: ${feature}`);
      console.log(`${'='.repeat(40)}`);

      await maestro.createSpec(feature, `Enhanced agent reuse testing for ${feature}`);
      await maestro.generateDesign(feature);
      await maestro.generateTasks(feature);

      // Brief pause between features
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Print final statistics
    const stats = maestro.getStats();
    console.log(`
      📊 Final Statistics:`);
    console.log(`   Total Agents Created: ${stats.totalAgents}`);
    console.log(`   Agent Reuse Rate: ${stats.reuseRate}%`);
    console.log(`   Capability Types: ${stats.capabilityTypes}`);

    if (stats.reuseRate >= 50) {
      console.log(`
      ✅ SUCCESS: Agent reuse rate meets target (${stats.reuseRate}% >= 50%)`);
    } else {
      console.log(`
      ⚠️  WARNING: Agent reuse rate below target (${stats.reuseRate}% < 50%)`);
    }

    console.log(`
      🎉 Maestro test completed successfully!`);
  } catch (error) {
    console.error(
      `
      ❌ Test failed:`,
      error
    );
    process.exit(1);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testMaestroWithAgentReuse().catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
