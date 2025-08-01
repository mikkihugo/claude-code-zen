/**
 * Coordination Manager - Agent coordination and swarm management
 * Handles agent lifecycle, communication, and task distribution
 * Following Google TypeScript standards with strict typing
 */

import { EventEmitter } from 'node:events';
import { injectable, inject } from '../di/index.js';
import { CORE_TOKENS } from '../di/index.js';
import type { IEventBus } from '../core/event-bus';
import type { ILogger, LogArgument } from '../core/logger';
import type {
  AgentCreatedPayload,
  AgentDestroyedPayload,
  AgentStatus,
  AgentStatusChangedPayload,
  AgentType,
  TaskAssignedPayload,
  TaskCompletedPayload,
  TaskFailedPayload,
} from '../types/event-types.js';

export interface CoordinationConfig {
  maxAgents: number;
  heartbeatInterval: number;
  timeout: number;
  enableHealthCheck?: boolean;
}

export interface Agent {
  id: string;
  type: string;
  status: 'idle' | 'busy' | 'error' | 'offline';
  capabilities: string[];
  lastHeartbeat: Date;
  taskCount: number;
  created: Date;
}

export interface Task {
  id: string;
  type: string;
  priority: number;
  assignedAgent?: string;
  status: 'pending' | 'assigned' | 'running' | 'completed' | 'failed';
  created: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Coordination Manager for agent and task management
 */
@injectable
export class CoordinationManager extends EventEmitter {
  private config: Required<CoordinationConfig>;
  private agents = new Map<string, Agent>();
  private tasks = new Map<string, Task>();
  private heartbeatTimer?: NodeJS.Timeout;
  private isRunning = false;

  constructor(
    config: CoordinationConfig,
    @inject(CORE_TOKENS.Logger) private logger: ILogger,
    @inject(CORE_TOKENS.EventBus) private eventBus: IEventBus
  ) {
    super();

    this.config = {
      maxAgents: config.maxAgents,
      heartbeatInterval: config.heartbeatInterval,
      timeout: config.timeout,
      enableHealthCheck: config.enableHealthCheck !== false,
    };

    this.setupEventHandlers();
    this.logger.info('CoordinationManager initialized');
  }

  /**
   * Start coordination services
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.logger?.info('Starting CoordinationManager...');

    if (this.config.enableHealthCheck) {
      this.startHeartbeatMonitoring();
    }

    this.isRunning = true;
    this.emit('started');
    this.logger?.info('CoordinationManager started');
  }

  /**
   * Stop coordination services
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.logger?.info('Stopping CoordinationManager...');

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }

    this.isRunning = false;
    this.emit('stopped');
    this.logger?.info('CoordinationManager stopped');
  }

  /**
   * Register an agent
   */
  async registerAgent(agentConfig: {
    id: string;
    type: string;
    capabilities: string[];
  }): Promise<void> {
    if (this.agents.size >= this.config.maxAgents) {
      throw new Error('Maximum agents limit reached');
    }

    const agent: Agent = {
      id: agentConfig.id,
      type: agentConfig.type,
      status: 'idle',
      capabilities: agentConfig.capabilities,
      lastHeartbeat: new Date(),
      taskCount: 0,
      created: new Date(),
    };

    this.agents.set(agent.id, agent);
    this.logger?.info(`Agent registered: ${agent.id}`, { type: agent.type });
    this.emit('agentRegistered', agent);
  }

  /**
   * Unregister an agent
   */
  async unregisterAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return;
    }

    this.agents.delete(agentId);
    this.logger?.info(`Agent unregistered: ${agentId}`);
    this.emit('agentUnregistered', { agentId });
  }

  /**
   * Submit a task for execution
   */
  async submitTask(taskConfig: {
    id: string;
    type: string;
    priority: number;
    requiredCapabilities?: string[];
    metadata?: Record<string, any>;
  }): Promise<void> {
    const task: Task = {
      id: taskConfig.id,
      type: taskConfig.type,
      priority: taskConfig.priority,
      status: 'pending',
      created: new Date(),
      metadata: taskConfig.metadata,
    };

    this.tasks.set(task.id, task);
    this.logger?.info(`Task submitted: ${task.id}`, { type: task.type });

    // Try to assign task immediately
    await this.assignTask(task, taskConfig.requiredCapabilities || []);
  }

  /**
   * Get available agents
   */
  getAvailableAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(
      (agent) => agent.status === 'idle' || agent.status === 'busy'
    );
  }

  /**
   * Get agents by capability
   */
  getAgentsByCapability(capability: string): Agent[] {
    return Array.from(this.agents.values()).filter((agent) =>
      agent.capabilities.includes(capability)
    );
  }

  /**
   * Get pending tasks
   */
  getPendingTasks(): Task[] {
    return Array.from(this.tasks.values()).filter((task) => task.status === 'pending');
  }

  /**
   * Update agent heartbeat
   */
  updateAgentHeartbeat(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.lastHeartbeat = new Date();
      if (agent.status === 'offline') {
        agent.status = 'idle';
        this.emit('agentOnline', { agentId });
      }
    }
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId: string, status: Task['status']): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      this.emit('taskStatusChanged', { taskId, status });

      if (status === 'completed' || status === 'failed') {
        // Free up the assigned agent
        if (task.assignedAgent) {
          const agent = this.agents.get(task.assignedAgent);
          if (agent && agent.status === 'busy') {
            agent.status = 'idle';
            agent.taskCount = Math.max(0, agent.taskCount - 1);
          }
        }
      }
    }
  }

  /**
   * Get coordination statistics
   */
  getStats(): {
    totalAgents: number;
    availableAgents: number;
    busyAgents: number;
    offlineAgents: number;
    totalTasks: number;
    pendingTasks: number;
    runningTasks: number;
    completedTasks: number;
  } {
    const agents = Array.from(this.agents.values());
    const tasks = Array.from(this.tasks.values());

    return {
      totalAgents: agents.length,
      availableAgents: agents.filter((a) => a.status === 'idle').length,
      busyAgents: agents.filter((a) => a.status === 'busy').length,
      offlineAgents: agents.filter((a) => a.status === 'offline').length,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter((t) => t.status === 'pending').length,
      runningTasks: tasks.filter((t) => t.status === 'running').length,
      completedTasks: tasks.filter((t) => t.status === 'completed').length,
    };
  }

  private setupEventHandlers(): void {
    if (this.eventBus) {
      this.eventBus.on('agent:heartbeat', (data: any) => {
        this.updateAgentHeartbeat(data.agentId);
      });

      this.eventBus.on('task:completed', (data: any) => {
        this.updateTaskStatus(data.taskId, 'completed');
      });

      this.eventBus.on('task:failed', (data: any) => {
        this.updateTaskStatus(data.taskId, 'failed');
      });
    }
  }

  private startHeartbeatMonitoring(): void {
    this.heartbeatTimer = setInterval(() => {
      this.checkAgentHeartbeats();
    }, this.config.heartbeatInterval);
  }

  private checkAgentHeartbeats(): void {
    const now = Date.now();
    const timeoutMs = this.config.timeout;

    for (const agent of Array.from(this.agents.values())) {
      const lastHeartbeatTime = agent.lastHeartbeat.getTime();
      if (now - lastHeartbeatTime > timeoutMs && agent.status !== 'offline') {
        agent.status = 'offline';
        this.logger?.warn(`Agent went offline: ${agent.id}`);
        this.emit('agentOffline', { agentId: agent.id });
      }
    }
  }

  private async assignTask(task: Task, requiredCapabilities: string[]): Promise<void> {
    // Find suitable agents
    const suitableAgents = Array.from(this.agents.values()).filter(
      (agent) =>
        agent.status === 'idle' &&
        (requiredCapabilities.length === 0 ||
          requiredCapabilities.some((cap) => agent.capabilities.includes(cap)))
    );

    if (suitableAgents.length === 0) {
      this.logger?.warn(`No suitable agents found for task: ${task.id}`);
      return;
    }

    // Sort by task count (load balancing)
    suitableAgents.sort((a, b) => a.taskCount - b.taskCount);
    const selectedAgent = suitableAgents[0];

    // Assign task
    task.assignedAgent = selectedAgent.id;
    task.status = 'assigned';
    selectedAgent.status = 'busy';
    selectedAgent.taskCount++;

    this.logger?.info(`Task assigned: ${task.id} -> ${selectedAgent.id}`);
    this.emit('taskAssigned', { taskId: task.id, agentId: selectedAgent.id });
  }
}

export default CoordinationManager;
