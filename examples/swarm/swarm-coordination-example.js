/** Advanced Swarm Coordination Example */
/** Demonstrates sophisticated swarm patterns and coordination strategies */

import { EventEmitter } from 'node:events';
import { ParallelSwarmOrchestrator } from '../../src/coordination/parallel-swarm-orchestrator.js';

class SwarmCoordinationExample extends EventEmitter {
  constructor() {
    super();
    this.orchestrator = null;
    this.swarms = new Map();
    this.activeWorkflows = new Map();
  }

  async initialize() {
    console.warn('🚀 Initializing Advanced Swarm Coordination Example');

    this.orchestrator = new ParallelSwarmOrchestrator({
      parallelMode: 0,
      maxWorkers: 8,
      loadBalancingStrategy: 'capability-based'});

    await this.orchestrator.initialize();

    // Set up event handlers
    this.setupEventHandlers();
    console.warn('✅ Swarm coordinator initialized');
    return this;
  }

  setupEventHandlers() {
    this.orchestrator.on('swarm-created', (data) => {
      console.warn(`🆕 Swarm created: ${data.swarmId} (${data.topology})`);
    });

    this.orchestrator.on('task-completed', (data) => {
      console.warn(`✅ Task completed: ${data.taskId}`);
    });

    this.orchestrator.on('swarm-metrics', (data) => {
      console.warn(`📊 Swarm metrics: ${JSON.stringify(data)}`);
    });
  }

  // Example 1: Hierarchical Code Analysis Swarm
  async hierarchicalAnalysisExample() {
    console.warn('\n=== Hierarchical Code Analysis Swarm ===');

    const swarmConfig = {
      id: 'analysis-swarm-001',
      topology: 'hierarchical',
      strategy: 'specialized',
      maxAgents: 15,
      queens: 2};

    // Create hierarchical swarm
    const swarm = await this.createSwarm(swarmConfig);

    // Spawn Queen coordinators
    await this.spawnQueen(swarm.id, {
      name: 'AnalysisQueen',
      capabilities: ['orchestration', 'analysis-coordination', 'reporting']});

    await this.spawnQueen(swarm.id, {
      name: 'OptimizationQueen',
      capabilities: ['optimization', 'performance-analysis', 'recommendations']});

    // Spawn specialized agents in hierarchy
    const agents = [
      { type: 'architect', name: 'ArchAnalyzer', capabilities: ['architecture-review', 'design-patterns'] },
      { type: 'coder', name: 'CodeAnalyzer', capabilities: ['code-quality', 'best-practices'] },
      { type: 'tester', name: 'TestAnalyzer', capabilities: ['test-coverage', 'test-quality'] },
      { type: 'reviewer', name: 'SecurityAnalyzer', capabilities: ['security-audit', 'vulnerability-scan'] },
      { type: 'optimizer', name: 'PerfAnalyzer', capabilities: ['performance-analysis', 'bottleneck-detection'] },
      { type: 'documenter', name: 'DocAnalyzer', capabilities: ['documentation-analysis', 'completeness-check'] },
    ];

    for (const agent of agents) {
      await this.spawnAgent(swarm.id, agent);
    }

    // Orchestrate complex analysis workflow
    const analysisTask = {
      id: 'repo-analysis-001',
      type: 'multi-stage-analysis',
      target: 'claude-code-zen repository',
      stages: [
        { name: 'architecture-analysis', assignee: 'ArchAnalyzer', parallel: true },
        { name: 'code-quality-analysis', assignee: 'CodeAnalyzer', parallel: true },
        { name: 'security-analysis', assignee: 'SecurityAnalyzer', parallel: true },
        { name: 'performance-analysis', assignee: 'PerfAnalyzer', parallel: true },
        { name: 'test-analysis', assignee: 'TestAnalyzer', parallel: true },
        { name: 'documentation-analysis', assignee: 'DocAnalyzer', parallel: true },
        { name: 'optimization-recommendations', assignee: 'OptimizationQueen', parallel: false },
      ]};

    const result = await this.orchestrateTask(swarm.id, analysisTask);
    console.warn('Analysis Result:', result);
    return { swarm, result };
  }

  // Example 2: Mesh Network Resilient Processing
  async meshResilienceExample() {
    console.warn('\n=== Mesh Network Resilient Processing ===');

    const swarmConfig = {
      id: 'resilient-swarm-002',
      topology: 'mesh',
      strategy: 'balanced',
      maxAgents: 9,
      faultTolerance: true};

    const swarm = await this.createSwarm(swarmConfig);

    // Create mesh of redundant agents
    const meshAgents = [];
    for (let i = 1; i <= 9; i++) {
      meshAgents.push({
        type: 'processor',
        name: `MeshProcessor-${i}`,
        capabilities: ['data-processing', 'fault-tolerance', 'redundancy'],
        x: (i - 1) % 3,
        y: Math.floor((i - 1) / 3)});
    }

    for (const agent of meshAgents) {
      await this.spawnAgent(swarm.id, agent);
    }

    // Set up full connectivity
    await this.establishMeshConnections(swarm.id, meshAgents);

    // Demonstrate fault tolerance
    const resilientTask = {
      id: 'resilient-processing-001',
      type: 'distributed-processing',
      data: this.generateLargeDataset(1000),
      redundancyLevel: 3,
      faultTolerance: {
        maxFailures: 2,
        retryStrategy: 'exponential-backoff',
        failoverTime: 5000}};

    // Simulate failures during processing
    setTimeout(() => this.simulateAgentFailure(swarm.id, 'MeshProcessor-5'), 2000);
    setTimeout(() => this.simulateAgentFailure(swarm.id, 'MeshProcessor-7'), 4000);

    const result = await this.orchestrateTask(swarm.id, resilientTask);
    console.warn('Resilient Processing Result:', result);
    return { swarm, result };
  }

  // Helper methods for swarm operations
  async createSwarm(config) {
    console.warn(`🏗️ Creating swarm: ${config.id} (${config.topology})`);
    const swarm = {
      id: config.id,
      topology: config.topology,
      strategy: config.strategy,
      agents: new Map(),
      queens: new Map(),
      createdAt: new Date(),
      status: 'active'};

    this.swarms.set(config.id, swarm);
    this.emit('swarm-created', { swarmId: config.id, topology: config.topology });
    return swarm;
  }

  async spawnQueen(swarmId, queenConfig) {
    console.warn(`👑 Spawning Queen: ${queenConfig.name}`);
    const swarm = this.swarms.get(swarmId);
    if (!swarm) throw new Error(`Swarm ${swarmId} not found`);

    const queen = {
      id: `queen-${queenConfig.name.toLowerCase()}`,
      name: queenConfig.name,
      type: 'queen',
      capabilities: queenConfig.capabilities,
      swarmId,
      status: 'active',
      spawnedAt: new Date()};

    swarm.queens.set(queen.id, queen);
    this.emit('queen-spawned', { swarmId, queenId: queen.id });
    return queen;
  }

  async spawnAgent(swarmId, agentConfig) {
    console.warn(`🤖 Spawning agent: ${agentConfig.name}`);
    const swarm = this.swarms.get(swarmId);
    if (!swarm) throw new Error(`Swarm ${swarmId} not found`);

    const agent = {
      id: `agent-${agentConfig.name.toLowerCase()}`,
      name: agentConfig.name,
      type: agentConfig.type,
      capabilities: agentConfig.capabilities,
      swarmId,
      status: 'active',
      spawnedAt: new Date(),
      ...agentConfig};

    swarm.agents.set(agent.id, agent);
    this.emit('agent-spawned', { swarmId, agentId: agent.id });
    return agent;
  }

  async orchestrateTask(swarmId, task) {
    console.warn(`⚡ Orchestrating task: ${task.id}`);
    const startTime = Date.now();

    // Simulate task execution
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = {
          taskId: task.id,
          swarmId,
          status: 'completed',
          executionTime: Date.now() - startTime,
          results: `Task ${task.id} completed successfully`,
          agentsUsed: Math.floor(Math.random() * 5) + 3,
          efficiency: Math.random() * 0.3 + 0.7};

        this.emit('task-completed', result);
        resolve(result);
      }, Math.random() * 3000 + 1000); // 1-4 seconds
    });
  }

  // Utility methods
  generateLargeDataset(size) {
    return Array.from({ length: size }, (_, i) => ({
      id: i,
      data: `data-${i}`,
      value: Math.random() * 100}));
  }

  async establishMeshConnections(swarmId, agents) {
    console.warn(`🕸️ Establishing mesh connections for swarm ${swarmId}`);
    // Implementation would set up full connectivity between all agents
  }

  async simulateAgentFailure(swarmId, agentName) {
    console.warn(`💥 Simulating failure of agent ${agentName} in swarm ${swarmId}`);
    this.emit('agent-failure', { swarmId, agentName });
  }

  // Run all examples
  async runAllExamples() {
    console.warn('\n🏃 Running all swarm coordination examples...');

    try {
      await this.hierarchicalAnalysisExample();
      await this.meshResilienceExample();
      console.warn('\n✅ All swarm coordination examples completed successfully');
    } catch (error) {
      console.error('❌ Swarm coordination example failed:', error);
    }
  }
}

// CLI runner
async function main() {
  const example = process.argv[2];
  const coordinator = new SwarmCoordinationExample();

  await coordinator.initialize();

  switch (example) {
    case 'hierarchical':
      await coordinator.hierarchicalAnalysisExample();
      break;
    case 'mesh':
      await coordinator.meshResilienceExample();
      break;
    case 'all':
      await coordinator.runAllExamples();
      break;
    default:
      console.warn('Usage: node swarm-coordination-example.js [hierarchical|mesh|all]');
      break;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SwarmCoordinationExample };
