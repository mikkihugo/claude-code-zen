/**
 * Example integration of SwarmCoordinator with Dependency Injection
 * Demonstrates how to migrate existing services to use DI patterns
 */

import {
  DIContainer,
  SingletonProvider,
  injectable,
  inject,
  createToken,
  CORE_TOKENS,
  SWARM_TOKENS,
  type ILogger,
  type IConfig,
  type ISwarmCoordinator,
  type IAgentRegistry,
  type IMessageBroker,
} from '../index.js';

// Example integration with existing systems

/**
 * Enhanced SwarmCoordinator using dependency injection
 * This shows how to refactor existing services to use DI
 */
@injectable
export class EnhancedSwarmCoordinator implements ISwarmCoordinator {
  private isInitialized = false;
  private agents = new Map<string, any>();
  private tasks = new Map<string, any>();

  constructor(
    @inject(CORE_TOKENS.Logger) private logger: ILogger,
    @inject(CORE_TOKENS.Config) private config: IConfig,
    @inject(SWARM_TOKENS.AgentRegistry) private agentRegistry: IAgentRegistry,
    @inject(SWARM_TOKENS.MessageBroker) private messageBroker: IMessageBroker
  ) {
    this.logger.info('SwarmCoordinator created with DI');
  }

  async initializeSwarm(options: any): Promise<void> {
    this.logger.info('Initializing swarm', { options });
    
    const maxAgents = this.config.get('swarm.maxAgents', 10);
    const topology = this.config.get('swarm.topology', 'mesh');
    
    this.logger.debug('Swarm configuration', { maxAgents, topology });
    
    this.isInitialized = true;
    this.logger.info('Swarm initialized successfully');
  }

  async addAgent(config: any): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Swarm must be initialized before adding agents');
    }

    const agentId = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.logger.info('Adding agent', { agentId, config });
    
    // Register with agent registry
    await this.agentRegistry.registerAgent({ id: agentId, ...config });
    
    // Store locally
    this.agents.set(agentId, { id: agentId, ...config, status: 'idle' });
    
    // Announce to swarm
    await this.messageBroker.broadcast({
      type: 'agent_joined',
      agentId,
      timestamp: Date.now(),
    });

    this.logger.info('Agent added successfully', { agentId });
    return agentId;
  }

  async removeAgent(agentId: string): Promise<void> {
    this.logger.info('Removing agent', { agentId });
    
    if (!this.agents.has(agentId)) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Unregister from agent registry
    await this.agentRegistry.unregisterAgent(agentId);
    
    // Remove locally
    this.agents.delete(agentId);
    
    // Announce to swarm
    await this.messageBroker.broadcast({
      type: 'agent_left',
      agentId,
      timestamp: Date.now(),
    });

    this.logger.info('Agent removed successfully', { agentId });
  }

  async assignTask(task: any): Promise<string> {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.logger.info('Assigning task', { taskId, task });
    
    // Find available agents
    const availableAgents = await this.agentRegistry.findAvailableAgents({
      status: 'idle',
      capabilities: task.requiredCapabilities || [],
    });

    if (availableAgents.length === 0) {
      throw new Error('No available agents for task assignment');
    }

    // Select best agent (simplified logic)
    const selectedAgent = availableAgents[0];
    
    // Store task
    this.tasks.set(taskId, {
      id: taskId,
      ...task,
      assignedAgentId: selectedAgent.id,
      status: 'assigned',
      timestamp: Date.now(),
    });

    // Notify agent via message broker
    await this.messageBroker.publish(`agent.${selectedAgent.id}`, {
      type: 'task_assignment',
      taskId,
      task,
      timestamp: Date.now(),
    });

    this.logger.info('Task assigned successfully', { taskId, agentId: selectedAgent.id });
    return taskId;
  }

  getMetrics(): any {
    const totalAgents = this.agents.size;
    const totalTasks = this.tasks.size;
    const completedTasks = Array.from(this.tasks.values()).filter(t => t.status === 'completed').length;
    const failedTasks = Array.from(this.tasks.values()).filter(t => t.status === 'failed').length;
    
    const metrics = {
      totalAgents,
      totalTasks,
      completedTasks,
      failedTasks,
      successRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
      timestamp: Date.now(),
    };

    this.logger.debug('Retrieved swarm metrics', metrics);
    return metrics;
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down swarm');
    
    // Remove all agents
    const agentIds = Array.from(this.agents.keys());
    for (const agentId of agentIds) {
      await this.removeAgent(agentId);
    }
    
    // Clear tasks
    this.tasks.clear();
    
    this.isInitialized = false;
    this.logger.info('Swarm shutdown complete');
  }
}

/**
 * Mock implementations for testing and development
 */
export class MockLogger implements ILogger {
  debug(message: string, meta?: any): void {
    console.debug(`[DEBUG] ${message}`, meta || '');
  }
  
  info(message: string, meta?: any): void {
    console.info(`[INFO] ${message}`, meta || '');
  }
  
  warn(message: string, meta?: any): void {
    console.warn(`[WARN] ${message}`, meta || '');
  }
  
  error(message: string, meta?: any): void {
    console.error(`[ERROR] ${message}`, meta || '');
  }
}

export class MockConfig implements IConfig {
  private data = new Map<string, any>();

  constructor(initialConfig: Record<string, any> = {}) {
    Object.entries(initialConfig).forEach(([key, value]) => {
      this.data.set(key, value);
    });
  }

  get<T>(key: string, defaultValue?: T): T {
    return this.data.has(key) ? this.data.get(key) : defaultValue;
  }

  set(key: string, value: any): void {
    this.data.set(key, value);
  }

  has(key: string): boolean {
    return this.data.has(key);
  }
}

export class MockAgentRegistry implements IAgentRegistry {
  private agents = new Map<string, any>();

  async registerAgent(agent: any): Promise<void> {
    this.agents.set(agent.id, agent);
  }

  async unregisterAgent(agentId: string): Promise<void> {
    this.agents.delete(agentId);
  }

  async getAgent(agentId: string): Promise<any> {
    return this.agents.get(agentId);
  }

  async getActiveAgents(): Promise<any[]> {
    return Array.from(this.agents.values()).filter(agent => agent.status !== 'offline');
  }

  async findAvailableAgents(criteria: any): Promise<any[]> {
    return Array.from(this.agents.values()).filter(agent => {
      if (criteria.status && agent.status !== criteria.status) return false;
      if (criteria.capabilities && !criteria.capabilities.every((cap: string) => 
        agent.capabilities?.includes(cap))) return false;
      return true;
    });
  }
}

export class MockMessageBroker implements IMessageBroker {
  private subscribers = new Map<string, Set<(message: any) => void>>();

  async publish(topic: string, message: any): Promise<void> {
    const handlers = this.subscribers.get(topic);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    }
  }

  async subscribe(topic: string, handler: (message: any) => void): Promise<void> {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic)!.add(handler);
  }

  async unsubscribe(topic: string, handler: (message: any) => void): Promise<void> {
    const handlers = this.subscribers.get(topic);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  async broadcast(message: any): Promise<void> {
    // Broadcast to all subscribers
    for (const handlers of this.subscribers.values()) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in broadcast handler:', error);
        }
      });
    }
  }
}

/**
 * Factory function to set up a complete DI container with swarm services
 */
export function createSwarmContainer(config: Record<string, any> = {}): DIContainer {
  const container = new DIContainer();

  // Register core services
  container.register(CORE_TOKENS.Logger, new SingletonProvider(() => new MockLogger()));
  container.register(CORE_TOKENS.Config, new SingletonProvider(() => new MockConfig(config)));

  // Register swarm services
  container.register(SWARM_TOKENS.AgentRegistry, new SingletonProvider(() => new MockAgentRegistry()));
  container.register(SWARM_TOKENS.MessageBroker, new SingletonProvider(() => new MockMessageBroker()));
  
  // Register enhanced swarm coordinator
  container.register(SWARM_TOKENS.SwarmCoordinator, new SingletonProvider(c => 
    new EnhancedSwarmCoordinator(
      c.resolve(CORE_TOKENS.Logger),
      c.resolve(CORE_TOKENS.Config),
      c.resolve(SWARM_TOKENS.AgentRegistry),
      c.resolve(SWARM_TOKENS.MessageBroker)
    )
  ));

  return container;
}

/**
 * Example usage demonstrating the complete workflow
 */
export async function demonstrateSwarmDI(): Promise<void> {
  console.log('=== SwarmCoordinator DI Integration Demo ===');
  
  // Create container with configuration
  const container = createSwarmContainer({
    'swarm.maxAgents': 20,
    'swarm.topology': 'hierarchical',
  });

  try {
    // Resolve the swarm coordinator
    const coordinator = container.resolve(SWARM_TOKENS.SwarmCoordinator);
    
    // Initialize swarm
    await coordinator.initializeSwarm({
      name: 'demo-swarm',
      topology: 'hierarchical',
    });

    // Add some agents
    const agent1Id = await coordinator.addAgent({
      type: 'worker',
      capabilities: ['data-processing', 'file-operations'],
    });

    const agent2Id = await coordinator.addAgent({
      type: 'coordinator',
      capabilities: ['task-management', 'coordination'],
    });

    // Assign a task
    const taskId = await coordinator.assignTask({
      type: 'data-processing',
      description: 'Process large dataset',
      requiredCapabilities: ['data-processing'],
      priority: 'high',
    });

    // Get metrics
    const metrics = coordinator.getMetrics();
    console.log('Swarm metrics:', JSON.stringify(metrics, null, 2));

    // Cleanup
    await coordinator.removeAgent(agent1Id);
    await coordinator.removeAgent(agent2Id);
    await coordinator.shutdown();

  } finally {
    // Dispose container
    await container.dispose();
  }
  
  console.log('=== Demo completed successfully ===');
}

// Export for testing
export { EnhancedSwarmCoordinator };