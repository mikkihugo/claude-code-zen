/**
 * Advanced Agent Lifecycle Management System
 * Provides dynamic agent spawning/termination, health monitoring,
 * automatic replacement, capability discovery, and performance ranking
 */

import { type ChildProcess, type SpawnOptions, spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import type { IEventBus } from '@core/event-bus';
import type { ILogger } from '@core/logger';

// Core lifecycle types
export interface AgentLifecycleConfig {
  maxAgents: number;
  minAgents: number;
  spawnTimeout: number;
  shutdownTimeout: number;
  healthCheckInterval: number;
  performanceWindow: number;
  autoRestart: boolean;
  autoScale: boolean;
  resourceLimits: ResourceLimits;
  qualityThresholds: QualityThresholds;
}

export interface ResourceLimits {
  maxCpuPercent: number;
  maxMemoryMB: number;
  maxNetworkMbps: number;
  maxDiskIOPS: number;
  maxOpenFiles: number;
  maxProcesses: number;
}

export interface QualityThresholds {
  minSuccessRate: number;
  minResponseTime: number;
  maxErrorRate: number;
  minReliability: number;
  minEfficiency: number;
}

export interface AgentTemplate {
  id: string;
  name: string;
  type: string;
  executable: string;
  args: string[];
  environment: Record<string, string>;
  capabilities: string[];
  resources: ResourceRequirements;
  healthCheck: HealthCheckConfig;
  scaling: ScalingConfig;
  metadata: Record<string, unknown>;
}

export interface ResourceRequirements {
  cpu: number;
  memory: number;
  network: number;
  disk: number;
  gpu?: number;
  priority: number;
}

export interface HealthCheckConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  retries: number;
  endpoint?: string;
  command?: string;
  expectedOutput?: string;
  thresholds: {
    cpu: number;
    memory: number;
    responseTime: number;
    errorRate: number;
  };
}

export interface ScalingConfig {
  minInstances: number;
  maxInstances: number;
  targetUtilization: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  cooldownPeriod: number;
  strategy: 'reactive' | 'predictive' | 'scheduled';
}

export interface AgentInstance {
  id: string;
  templateId: string;
  name: string;
  type: string;
  status: AgentStatus;
  process?: ChildProcess;
  pid?: number;
  startTime: Date;
  lastSeen: Date;
  health: HealthStatus;
  performance: PerformanceMetrics;
  resources: ResourceUsage;
  capabilities: DiscoveredCapabilities;
  assignments: TaskAssignment[];
  errors: AgentError[];
  metadata: Record<string, unknown>;
}

export type AgentStatus =
  | 'spawning'
  | 'initializing'
  | 'ready'
  | 'active'
  | 'idle'
  | 'busy'
  | 'degraded'
  | 'unhealthy'
  | 'terminating'
  | 'terminated'
  | 'failed';

export interface HealthStatus {
  overall: number; // 0-1
  components: {
    responsiveness: number;
    performance: number;
    reliability: number;
    resourceUsage: number;
    connectivity: number;
  };
  issues: HealthIssue[];
  trend: 'improving' | 'stable' | 'degrading';
  lastCheck: Date;
}

export interface HealthIssue {
  type: 'performance' | 'reliability' | 'resource' | 'connectivity' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolution?: string;
  impact: number; // 0-1
}

export interface PerformanceMetrics {
  tasksCompleted: number;
  tasksFailed: number;
  averageResponseTime: number;
  successRate: number;
  throughput: number;
  efficiency: number;
  reliability: number;
  qualityScore: number;
  uptime: number;
  lastActivity: Date;
  trends: PerformanceTrend[];
}

export interface PerformanceTrend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  rate: number;
  confidence: number;
  period: number;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  network: number;
  disk: number;
  gpu?: number;
  handles: number;
  threads: number;
  timestamp: Date;
}

export interface DiscoveredCapabilities {
  declared: string[];
  verified: string[];
  inferred: string[];
  specialized: string[];
  quality: Record<string, number>;
  confidence: Record<string, number>;
  lastUpdated: Date;
}

export interface TaskAssignment {
  taskId: string;
  assignedAt: Date;
  expectedDuration: number;
  status: 'assigned' | 'active' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  quality: number;
}

export interface AgentError {
  timestamp: Date;
  type: 'startup' | 'runtime' | 'communication' | 'resource' | 'task' | 'shutdown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  context: Record<string, unknown>;
  recovered: boolean;
  recovery?: string;
}

export interface SpawnRequest {
  templateId: string;
  count: number;
  priority: number;
  constraints?: Record<string, unknown>;
  timeout?: number;
  requester: string;
  reason: string;
}

export interface SpawnResult {
  success: boolean;
  agentIds: string[];
  failures: Array<{ error: string; reason: string }>;
  duration: number;
}

export interface TerminationRequest {
  agentIds: string[];
  reason: string;
  graceful: boolean;
  timeout?: number;
  requester: string;
}

export interface TerminationResult {
  success: boolean;
  terminated: string[];
  failures: Array<{ agentId: string; error: string }>;
  duration: number;
}

export interface ScalingDecision {
  action: 'scale_up' | 'scale_down' | 'no_action';
  targetCount: number;
  currentCount: number;
  reasoning: string[];
  confidence: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface LifecycleMetrics {
  totalAgents: number;
  agentsByStatus: Record<AgentStatus, number>;
  agentsByType: Record<string, number>;
  spawnRate: number;
  terminationRate: number;
  averageLifetime: number;
  averageHealth: number;
  resourceUtilization: ResourceUsage;
  failureRate: number;
  recoveryRate: number;
}

/**
 * Advanced Agent Lifecycle Manager with intelligent orchestration
 */
export class AgentLifecycleManager extends EventEmitter {
  private agents = new Map<string, AgentInstance>();
  private templates = new Map<string, AgentTemplate>();
  private spawnQueue: SpawnRequest[] = [];
  private terminationQueue: TerminationRequest[] = [];
  private healthMonitor: HealthMonitor;
  private performanceTracker: PerformanceTracker;
  private resourceMonitor: ResourceMonitor;
  private capabilityDiscovery: CapabilityDiscovery;
  private scalingEngine: ScalingEngine;
  private recoveryEngine: RecoveryEngine;
  private metrics: LifecycleMetrics;
  private processingInterval?: NodeJS.Timeout;
  private healthInterval?: NodeJS.Timeout;
  private scalingInterval?: NodeJS.Timeout;

  constructor(
    private config: AgentLifecycleConfig,
    private logger: ILogger,
    private eventBus: IEventBus
  ) {
    super();

    this.healthMonitor = new HealthMonitor(this.config, this.logger);
    this.performanceTracker = new PerformanceTracker(this.config, this.logger);
    this.resourceMonitor = new ResourceMonitor(this.config, this.logger);
    this.capabilityDiscovery = new CapabilityDiscovery(this.logger);
    this.scalingEngine = new ScalingEngine(this.config, this.logger);
    this.recoveryEngine = new RecoveryEngine(this.config, this.logger);

    this.metrics = this.initializeMetrics();
    this.setupEventHandlers();
    this.startProcessing();
  }

  private setupEventHandlers(): void {
    this.eventBus.on('agent:heartbeat', (data: any) => {
      this.handleAgentHeartbeat(data);
    });

    this.eventBus.on('agent:task-completed', (data: any) => {
      this.handleTaskCompletion(data);
    });

    this.eventBus.on('agent:task-failed', (data: any) => {
      this.handleTaskFailure(data);
    });

    this.eventBus.on('agent:error', (data: any) => {
      this.handleAgentError(data);
    });

    this.eventBus.on('system:resource-pressure', (data: any) => {
      this.handleResourcePressure(data);
    });

    this.eventBus.on('workload:demand-change', (data: any) => {
      this.handleDemandChange(data);
    });
  }

  /**
   * Register an agent template
   */
  async registerTemplate(template: AgentTemplate): Promise<void> {
    this.templates.set(template.id, template);

    this.logger.info('Agent template registered', {
      templateId: template.id,
      name: template.name,
      type: template.type,
      capabilities: template.capabilities,
    });

    this.emit('template:registered', { templateId: template.id });
  }

  /**
   * Spawn agents from template
   */
  async spawnAgents(request: SpawnRequest): Promise<SpawnResult> {
    const startTime = Date.now();
    const template = this.templates.get(request.templateId);

    if (!template) {
      throw new Error(`Template ${request.templateId} not found`);
    }

    // Check limits
    if (this.agents.size + request.count > this.config.maxAgents) {
      throw new Error(`Would exceed maximum agent limit (${this.config.maxAgents})`);
    }

    const result: SpawnResult = {
      success: true,
      agentIds: [],
      failures: [],
      duration: 0,
    };

    // Add to spawn queue if processing
    this.spawnQueue.push(request);

    try {
      // Spawn agents
      for (let i = 0; i < request.count; i++) {
        try {
          const agentId = await this.spawnSingleAgent(template, request);
          result.agentIds.push(agentId);
        } catch (error) {
          result.failures.push({
            error: error instanceof Error ? error.message : String(error),
            reason: 'spawn_failed',
          });
          result.success = false;
        }
      }

      result.duration = Date.now() - startTime;

      this.logger.info('Agent spawn request completed', {
        templateId: request.templateId,
        requested: request.count,
        spawned: result.agentIds.length,
        failures: result.failures.length,
        duration: result.duration,
      });

      this.emit('agents:spawned', { request, result });
      return result;
    } catch (error) {
      this.logger.error('Agent spawn request failed', { request, error });
      throw error;
    }
  }

  /**
   * Terminate agents
   */
  async terminateAgents(request: TerminationRequest): Promise<TerminationResult> {
    const startTime = Date.now();
    const result: TerminationResult = {
      success: true,
      terminated: [],
      failures: [],
      duration: 0,
    };

    try {
      for (const agentId of request.agentIds) {
        try {
          await this.terminateSingleAgent(agentId, request);
          result.terminated.push(agentId);
        } catch (error) {
          result.failures.push({
            agentId,
            error: error instanceof Error ? error.message : String(error),
          });
          result.success = false;
        }
      }

      result.duration = Date.now() - startTime;

      this.logger.info('Agent termination request completed', {
        requested: request.agentIds.length,
        terminated: result.terminated.length,
        failures: result.failures.length,
        duration: result.duration,
      });

      this.emit('agents:terminated', { request, result });
      return result;
    } catch (error) {
      this.logger.error('Agent termination request failed', { request, error });
      throw error;
    }
  }

  /**
   * Get agent status
   */
  getAgent(agentId: string): AgentInstance | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents
   */
  getAllAgents(): AgentInstance[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents by status
   */
  getAgentsByStatus(status: AgentStatus): AgentInstance[] {
    return Array.from(this.agents.values()).filter((agent) => agent.status === status);
  }

  /**
   * Get agents by type
   */
  getAgentsByType(type: string): AgentInstance[] {
    return Array.from(this.agents.values()).filter((agent) => agent.type === type);
  }

  /**
   * Get lifecycle metrics
   */
  getMetrics(): LifecycleMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Get scaling recommendation
   */
  async getScalingRecommendation(): Promise<ScalingDecision> {
    return await this.scalingEngine.analyze(this.agents, this.templates, this.metrics);
  }

  /**
   * Manually trigger scaling
   */
  async triggerScaling(templateId: string, targetCount: number): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const currentCount = this.getAgentsByType(template.type).length;

    if (targetCount > currentCount) {
      await this.spawnAgents({
        templateId,
        count: targetCount - currentCount,
        priority: 1,
        requester: 'manual',
        reason: 'manual_scaling',
      });
    } else if (targetCount < currentCount) {
      const agentsToTerminate = this.getAgentsByType(template.type)
        .slice(0, currentCount - targetCount)
        .map((agent) => agent.id);

      await this.terminateAgents({
        agentIds: agentsToTerminate,
        reason: 'manual_scaling',
        graceful: true,
        requester: 'manual',
      });
    }
  }

  /**
   * Force health check on agent
   */
  async checkAgentHealth(agentId: string): Promise<HealthStatus> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    return await this.healthMonitor.checkHealth(agent);
  }

  /**
   * Get agent performance ranking
   */
  getPerformanceRanking(type?: string): Array<{ agentId: string; score: number; rank: number }> {
    let agents = Array.from(this.agents.values());

    if (type) {
      agents = agents.filter((agent) => agent.type === type);
    }

    const scored = agents.map((agent) => ({
      agentId: agent.id,
      score: this.calculatePerformanceScore(agent),
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }

  private async spawnSingleAgent(template: AgentTemplate, request: SpawnRequest): Promise<string> {
    const agentId = this.generateAgentId(template.type);

    const agent: AgentInstance = {
      id: agentId,
      templateId: template.id,
      name: `${template.name}-${agentId.slice(-8)}`,
      type: template.type,
      status: 'spawning',
      startTime: new Date(),
      lastSeen: new Date(),
      health: this.initializeHealth(),
      performance: this.initializePerformance(),
      resources: this.initializeResourceUsage(),
      capabilities: this.initializeCapabilities(template.capabilities),
      assignments: [],
      errors: [],
      metadata: { ...template.metadata, spawnRequest: request },
    };

    this.agents.set(agentId, agent);

    try {
      // Spawn process
      const process = await this.createAgentProcess(agent, template);
      agent.process = process;
      agent.pid = process.pid;
      agent.status = 'initializing';

      // Wait for initialization
      await this.waitForAgentReady(agent, request.timeout || this.config.spawnTimeout);

      agent.status = 'ready';

      this.logger.info('Agent spawned successfully', {
        agentId,
        templateId: template.id,
        pid: agent.pid,
      });

      // Start monitoring
      this.startAgentMonitoring(agent);

      this.emit('agent:spawned', { agent });
      return agentId;
    } catch (error) {
      agent.status = 'failed';
      this.addAgentError(agent, {
        timestamp: new Date(),
        type: 'startup',
        severity: 'critical',
        message: error instanceof Error ? error.message : String(error),
        context: { templateId: template.id, request },
        recovered: false,
      });

      this.agents.delete(agentId);
      throw error;
    }
  }

  private async terminateSingleAgent(agentId: string, request: TerminationRequest): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    if (agent.status === 'terminated' || agent.status === 'terminating') {
      return; // Already terminated or terminating
    }

    agent.status = 'terminating';

    try {
      // Graceful shutdown
      if (request.graceful && agent.process) {
        await this.gracefulShutdown(agent, request.timeout || this.config.shutdownTimeout);
      } else if (agent.process) {
        // Force termination
        agent.process.kill('SIGKILL');
      }

      agent.status = 'terminated';

      this.logger.info('Agent terminated', {
        agentId,
        reason: request.reason,
        graceful: request.graceful,
      });

      this.stopAgentMonitoring(agent);
      this.emit('agent:terminated', { agent, reason: request.reason });

      // Keep agent record for metrics but mark as terminated
      // Could implement cleanup policy here
    } catch (error) {
      agent.status = 'failed';
      this.addAgentError(agent, {
        timestamp: new Date(),
        type: 'shutdown',
        severity: 'high',
        message: error instanceof Error ? error.message : String(error),
        context: { request },
        recovered: false,
      });

      throw error;
    }
  }

  private async createAgentProcess(
    agent: AgentInstance,
    template: AgentTemplate
  ): Promise<ChildProcess> {
    const env = {
      ...process.env,
      ...template.environment,
      AGENT_ID: agent.id,
      AGENT_TYPE: agent.type,
      AGENT_NAME: agent.name,
    };

    const options: SpawnOptions = {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false,
    };

    const childProcess = spawn(template.executable, template.args, options);

    // Setup process event handlers
    childProcess.on('exit', (code, signal) => {
      this.handleProcessExit(agent, code, signal);
    });

    childProcess.on('error', (error) => {
      this.handleProcessError(agent, error);
    });

    childProcess.stdout?.on('data', (data) => {
      this.handleProcessOutput(agent, data.toString(), 'stdout');
    });

    childProcess.stderr?.on('data', (data) => {
      this.handleProcessOutput(agent, data.toString(), 'stderr');
    });

    return childProcess;
  }

  private async waitForAgentReady(agent: AgentInstance, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Agent ${agent.id} initialization timeout`));
      }, timeout);

      const checkReady = () => {
        // This would check for agent readiness signals
        // For now, simulate with a delay
        setTimeout(() => {
          clearTimeout(timer);
          resolve();
        }, 1000);
      };

      checkReady();
    });
  }

  private async gracefulShutdown(agent: AgentInstance, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!agent.process) {
        resolve();
        return;
      }

      const timer = setTimeout(() => {
        // Force kill if graceful shutdown times out
        agent.process?.kill('SIGKILL');
        reject(new Error(`Agent ${agent.id} graceful shutdown timeout`));
      }, timeout);

      agent.process.on('exit', () => {
        clearTimeout(timer);
        resolve();
      });

      // Send termination signal
      agent.process.kill('SIGTERM');
    });
  }

  private startAgentMonitoring(agent: AgentInstance): void {
    // Individual agent monitoring would be implemented here
    // For now, rely on global monitoring intervals
  }

  private stopAgentMonitoring(agent: AgentInstance): void {
    // Stop individual agent monitoring
  }

  private startProcessing(): void {
    // Main processing loop
    this.processingInterval = setInterval(async () => {
      await this.processSpawnQueue();
      await this.processTerminationQueue();
      await this.updateMetrics();
    }, 1000);

    // Health monitoring loop
    this.healthInterval = setInterval(async () => {
      await this.performHealthChecks();
      await this.detectUnhealthyAgents();
    }, this.config.healthCheckInterval);

    // Scaling loop
    this.scalingInterval = setInterval(async () => {
      if (this.config.autoScale) {
        await this.performAutoScaling();
      }
    }, 30000); // Every 30 seconds
  }

  private async processSpawnQueue(): Promise<void> {
    // Process queued spawn requests
    const request = this.spawnQueue.shift();
    if (request) {
      // Process would handle spawn request
    }
  }

  private async processTerminationQueue(): Promise<void> {
    // Process queued termination requests
    const request = this.terminationQueue.shift();
    if (request) {
      // Process would handle termination request
    }
  }

  private async performHealthChecks(): Promise<void> {
    const healthPromises = Array.from(this.agents.values())
      .filter((agent) => agent.status !== 'terminated' && agent.status !== 'terminating')
      .map((agent) => this.healthMonitor.checkHealth(agent));

    await Promise.allSettled(healthPromises);
  }

  private async detectUnhealthyAgents(): Promise<void> {
    for (const agent of this.agents.values()) {
      if (agent.health.overall < 0.3 && agent.status !== 'terminated') {
        await this.handleUnhealthyAgent(agent);
      }
    }
  }

  private async handleUnhealthyAgent(agent: AgentInstance): Promise<void> {
    this.logger.warn('Unhealthy agent detected', {
      agentId: agent.id,
      health: agent.health.overall,
      issues: agent.health.issues,
    });

    if (this.config.autoRestart) {
      try {
        await this.recoveryEngine.recoverAgent(agent, this.templates.get(agent.templateId)!);
        this.emit('agent:recovered', { agentId: agent.id });
      } catch (error) {
        this.logger.error('Agent recovery failed', { agentId: agent.id, error });
        this.emit('agent:recovery-failed', { agentId: agent.id, error });
      }
    }
  }

  private async performAutoScaling(): Promise<void> {
    for (const template of this.templates.values()) {
      const decision = await this.scalingEngine.analyze(this.agents, this.templates, this.metrics);

      if (decision.action !== 'no_action' && decision.confidence > 0.7) {
        this.logger.info('Auto-scaling triggered', {
          templateId: template.id,
          action: decision.action,
          targetCount: decision.targetCount,
          reasoning: decision.reasoning,
        });

        await this.executeScalingDecision(template.id, decision);
      }
    }
  }

  private async executeScalingDecision(
    templateId: string,
    decision: ScalingDecision
  ): Promise<void> {
    try {
      if (decision.action === 'scale_up') {
        const spawnCount = decision.targetCount - decision.currentCount;
        await this.spawnAgents({
          templateId,
          count: spawnCount,
          priority: decision.urgency === 'critical' ? 0 : 1,
          requester: 'auto-scaler',
          reason: `auto_scale_up: ${decision.reasoning.join(', ')}`,
        });
      } else if (decision.action === 'scale_down') {
        const terminateCount = decision.currentCount - decision.targetCount;
        const agentsToTerminate = this.selectAgentsForTermination(templateId, terminateCount);

        await this.terminateAgents({
          agentIds: agentsToTerminate,
          reason: `auto_scale_down: ${decision.reasoning.join(', ')}`,
          graceful: true,
          requester: 'auto-scaler',
        });
      }

      this.emit('scaling:executed', { templateId, decision });
    } catch (error) {
      this.logger.error('Scaling execution failed', { templateId, decision, error });
      this.emit('scaling:failed', { templateId, decision, error });
    }
  }

  private selectAgentsForTermination(templateId: string, count: number): string[] {
    const template = this.templates.get(templateId);
    if (!template) return [];

    // Select least performing agents for termination
    const agents = this.getAgentsByType(template.type)
      .filter((agent) => agent.status !== 'terminated' && agent.status !== 'terminating')
      .sort((a, b) => this.calculatePerformanceScore(a) - this.calculatePerformanceScore(b))
      .slice(0, count);

    return agents.map((agent) => agent.id);
  }

  private calculatePerformanceScore(agent: AgentInstance): number {
    const metrics = agent.performance;

    // Weighted performance score
    const successRateWeight = 0.3;
    const responseTimeWeight = 0.2;
    const throughputWeight = 0.2;
    const reliabilityWeight = 0.15;
    const efficiencyWeight = 0.15;

    const score =
      metrics.successRate * successRateWeight +
      Math.max(0, 1 - metrics.averageResponseTime / 10000) * responseTimeWeight +
      Math.min(1, metrics.throughput / 100) * throughputWeight +
      metrics.reliability * reliabilityWeight +
      metrics.efficiency * efficiencyWeight;

    return Math.max(0, Math.min(1, score));
  }

  private updateMetrics(): void {
    const agents = Array.from(this.agents.values());

    // Count by status
    const agentsByStatus: Record<AgentStatus, number> = {
      spawning: 0,
      initializing: 0,
      ready: 0,
      active: 0,
      idle: 0,
      busy: 0,
      degraded: 0,
      unhealthy: 0,
      terminating: 0,
      terminated: 0,
      failed: 0,
    };

    // Count by type
    const agentsByType: Record<string, number> = {};

    let totalHealth = 0;
    let healthyAgents = 0;

    for (const agent of agents) {
      agentsByStatus[agent.status]++;
      agentsByType[agent.type] = (agentsByType[agent.type] || 0) + 1;

      if (agent.status !== 'terminated' && agent.status !== 'failed') {
        totalHealth += agent.health.overall;
        healthyAgents++;
      }
    }

    this.metrics = {
      totalAgents: agents.length,
      agentsByStatus,
      agentsByType,
      spawnRate: this.calculateSpawnRate(),
      terminationRate: this.calculateTerminationRate(),
      averageLifetime: this.calculateAverageLifetime(),
      averageHealth: healthyAgents > 0 ? totalHealth / healthyAgents : 1,
      resourceUtilization: this.calculateResourceUtilization(),
      failureRate: this.calculateFailureRate(),
      recoveryRate: this.calculateRecoveryRate(),
    };
  }

  private calculateSpawnRate(): number {
    // Calculate spawns per hour over last hour
    const oneHourAgo = Date.now() - 3600000;
    const recentSpawns = Array.from(this.agents.values()).filter(
      (agent) => agent.startTime.getTime() > oneHourAgo
    );

    return recentSpawns.length;
  }

  private calculateTerminationRate(): number {
    // Calculate terminations per hour (would need to track termination times)
    return 0; // Placeholder
  }

  private calculateAverageLifetime(): number {
    const now = Date.now();
    const lifetimes = Array.from(this.agents.values())
      .filter((agent) => agent.status === 'terminated')
      .map((agent) => now - agent.startTime.getTime());

    return lifetimes.length > 0
      ? lifetimes.reduce((sum, time) => sum + time, 0) / lifetimes.length
      : 0;
  }

  private calculateResourceUtilization(): ResourceUsage {
    const agents = Array.from(this.agents.values()).filter(
      (agent) => agent.status !== 'terminated'
    );

    if (agents.length === 0) {
      return this.initializeResourceUsage();
    }

    const totalResources = agents.reduce(
      (sum, agent) => ({
        cpu: sum.cpu + agent.resources.cpu,
        memory: sum.memory + agent.resources.memory,
        network: sum.network + agent.resources.network,
        disk: sum.disk + agent.resources.disk,
        handles: sum.handles + agent.resources.handles,
        threads: sum.threads + agent.resources.threads,
      }),
      { cpu: 0, memory: 0, network: 0, disk: 0, handles: 0, threads: 0 }
    );

    return {
      ...totalResources,
      gpu: 0,
      timestamp: new Date(),
    };
  }

  private calculateFailureRate(): number {
    const totalAgents = this.metrics.totalAgents;
    const failedAgents = this.metrics.agentsByStatus.failed;

    return totalAgents > 0 ? failedAgents / totalAgents : 0;
  }

  private calculateRecoveryRate(): number {
    // Would track recovery attempts and successes
    return 0.8; // Placeholder
  }

  // Event handlers
  private handleAgentHeartbeat(data: any): void {
    const agent = this.agents.get(data.agentId);
    if (agent) {
      agent.lastSeen = new Date();
      if (agent.status === 'ready') {
        agent.status = 'idle';
      }
    }
  }

  private handleTaskCompletion(data: any): void {
    const agent = this.agents.get(data.agentId);
    if (agent) {
      agent.performance.tasksCompleted++;
      agent.performance.lastActivity = new Date();

      const assignment = agent.assignments.find((a) => a.taskId === data.taskId);
      if (assignment) {
        assignment.status = 'completed';
        assignment.progress = 100;
        assignment.quality = data.quality || 1.0;
      }

      this.performanceTracker.updateMetrics(agent, data);
    }
  }

  private handleTaskFailure(data: any): void {
    const agent = this.agents.get(data.agentId);
    if (agent) {
      agent.performance.tasksFailed++;
      agent.performance.lastActivity = new Date();

      const assignment = agent.assignments.find((a) => a.taskId === data.taskId);
      if (assignment) {
        assignment.status = 'failed';
      }

      this.addAgentError(agent, {
        timestamp: new Date(),
        type: 'task',
        severity: 'medium',
        message: `Task ${data.taskId} failed: ${data.error}`,
        context: data,
        recovered: false,
      });
    }
  }

  private handleAgentError(data: any): void {
    const agent = this.agents.get(data.agentId);
    if (agent) {
      this.addAgentError(agent, data.error);

      if (data.error.severity === 'critical') {
        agent.status = 'unhealthy';
      }
    }
  }

  private handleResourcePressure(data: any): void {
    this.logger.warn('System resource pressure detected', data);

    // Could trigger scaling down or resource optimization
    if (data.severity === 'critical') {
      this.emit('resource:pressure-critical', data);
    }
  }

  private handleDemandChange(data: any): void {
    this.logger.info('Workload demand change detected', data);

    // Trigger scaling analysis
    if (this.config.autoScale) {
      this.performAutoScaling().catch((error) => {
        this.logger.error('Auto-scaling failed after demand change', { error });
      });
    }
  }

  private handleProcessExit(
    agent: AgentInstance,
    code: number | null,
    signal: string | null
  ): void {
    this.logger.info('Agent process exited', {
      agentId: agent.id,
      code,
      signal,
    });

    if (agent.status !== 'terminating') {
      // Unexpected exit
      agent.status = 'failed';
      this.addAgentError(agent, {
        timestamp: new Date(),
        type: 'runtime',
        severity: 'high',
        message: `Process exited unexpectedly (code: ${code}, signal: ${signal})`,
        context: { code, signal },
        recovered: false,
      });

      this.emit('agent:unexpected-exit', { agent, code, signal });
    }
  }

  private handleProcessError(agent: AgentInstance, error: Error): void {
    this.logger.error('Agent process error', {
      agentId: agent.id,
      error: error.message,
    });

    agent.status = 'failed';
    this.addAgentError(agent, {
      timestamp: new Date(),
      type: 'runtime',
      severity: 'critical',
      message: error.message,
      stack: error.stack,
      context: { error: error.toString() },
      recovered: false,
    });
  }

  private handleProcessOutput(
    agent: AgentInstance,
    data: string,
    stream: 'stdout' | 'stderr'
  ): void {
    // Log agent output
    this.logger.debug(`Agent ${stream}`, {
      agentId: agent.id,
      data: data.trim(),
    });

    // Could parse output for health indicators, capability discovery, etc.
    this.capabilityDiscovery.processOutput(agent, data, stream);
  }

  private addAgentError(agent: AgentInstance, error: AgentError): void {
    agent.errors.push(error);

    // Keep only recent errors
    if (agent.errors.length > 100) {
      agent.errors.shift();
    }

    this.emit('agent:error', { agentId: agent.id, error });
  }

  private generateAgentId(type: string): string {
    return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
  }

  private initializeHealth(): HealthStatus {
    return {
      overall: 1.0,
      components: {
        responsiveness: 1.0,
        performance: 1.0,
        reliability: 1.0,
        resourceUsage: 1.0,
        connectivity: 1.0,
      },
      issues: [],
      trend: 'stable',
      lastCheck: new Date(),
    };
  }

  private initializePerformance(): PerformanceMetrics {
    return {
      tasksCompleted: 0,
      tasksFailed: 0,
      averageResponseTime: 0,
      successRate: 1.0,
      throughput: 0,
      efficiency: 1.0,
      reliability: 1.0,
      qualityScore: 1.0,
      uptime: 0,
      lastActivity: new Date(),
      trends: [],
    };
  }

  private initializeResourceUsage(): ResourceUsage {
    return {
      cpu: 0,
      memory: 0,
      network: 0,
      disk: 0,
      handles: 0,
      threads: 0,
      timestamp: new Date(),
    };
  }

  private initializeCapabilities(declared: string[]): DiscoveredCapabilities {
    return {
      declared,
      verified: [],
      inferred: [],
      specialized: [],
      quality: {},
      confidence: {},
      lastUpdated: new Date(),
    };
  }

  private initializeMetrics(): LifecycleMetrics {
    return {
      totalAgents: 0,
      agentsByStatus: {
        spawning: 0,
        initializing: 0,
        ready: 0,
        active: 0,
        idle: 0,
        busy: 0,
        degraded: 0,
        unhealthy: 0,
        terminating: 0,
        terminated: 0,
        failed: 0,
      },
      agentsByType: {},
      spawnRate: 0,
      terminationRate: 0,
      averageLifetime: 0,
      averageHealth: 1.0,
      resourceUtilization: this.initializeResourceUsage(),
      failureRate: 0,
      recoveryRate: 0,
    };
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down agent lifecycle manager');

    // Stop processing
    if (this.processingInterval) clearInterval(this.processingInterval);
    if (this.healthInterval) clearInterval(this.healthInterval);
    if (this.scalingInterval) clearInterval(this.scalingInterval);

    // Terminate all agents
    const activeAgents = Array.from(this.agents.values())
      .filter((agent) => agent.status !== 'terminated' && agent.status !== 'terminating')
      .map((agent) => agent.id);

    if (activeAgents.length > 0) {
      await this.terminateAgents({
        agentIds: activeAgents,
        reason: 'system_shutdown',
        graceful: true,
        timeout: this.config.shutdownTimeout,
        requester: 'system',
      });
    }

    this.emit('shutdown');
  }
}

// Supporting classes
class HealthMonitor {
  constructor(
    private config: AgentLifecycleConfig,
    private logger: ILogger
  ) {}

  async checkHealth(agent: AgentInstance): Promise<HealthStatus> {
    // Implement comprehensive health checking
    const health = { ...agent.health };

    // Update components
    health.components.responsiveness = this.checkResponsiveness(agent);
    health.components.performance = this.checkPerformance(agent);
    health.components.reliability = this.checkReliability(agent);
    health.components.resourceUsage = this.checkResourceUsage(agent);
    health.components.connectivity = this.checkConnectivity(agent);

    // Calculate overall health
    health.overall = Object.values(health.components).reduce((sum, val) => sum + val, 0) / 5;
    health.lastCheck = new Date();

    // Update agent health
    agent.health = health;

    return health;
  }

  private checkResponsiveness(agent: AgentInstance): number {
    const now = Date.now();
    const timeSinceLastSeen = now - agent.lastSeen.getTime();

    if (timeSinceLastSeen > 60000) return 0; // No activity in 1 minute
    if (timeSinceLastSeen > 30000) return 0.5; // No activity in 30 seconds
    return 1.0;
  }

  private checkPerformance(agent: AgentInstance): number {
    return agent.performance.efficiency;
  }

  private checkReliability(agent: AgentInstance): number {
    return agent.performance.reliability;
  }

  private checkResourceUsage(agent: AgentInstance): number {
    // Higher resource usage = lower score
    const cpuScore = Math.max(0, 1 - agent.resources.cpu);
    const memoryScore = Math.max(0, 1 - agent.resources.memory);
    return (cpuScore + memoryScore) / 2;
  }

  private checkConnectivity(agent: AgentInstance): number {
    // Simplified connectivity check
    return agent.process && !agent.process.killed ? 1.0 : 0.0;
  }
}

class PerformanceTracker {
  constructor(
    private config: AgentLifecycleConfig,
    private logger: ILogger
  ) {}

  updateMetrics(agent: AgentInstance, data: any): void {
    // Update performance metrics based on task completion data
    const metrics = agent.performance;

    // Update success rate
    const totalTasks = metrics.tasksCompleted + metrics.tasksFailed;
    metrics.successRate = totalTasks > 0 ? metrics.tasksCompleted / totalTasks : 1.0;

    // Update response time (if provided)
    if (data.responseTime) {
      metrics.averageResponseTime = this.updateMovingAverage(
        metrics.averageResponseTime,
        data.responseTime,
        totalTasks
      );
    }

    // Update efficiency and reliability
    metrics.efficiency = Math.min(
      1.0,
      metrics.successRate * (1000 / Math.max(1, metrics.averageResponseTime))
    );
    metrics.reliability = metrics.successRate ** 2; // Penalize failures more
  }

  private updateMovingAverage(current: number, newValue: number, count: number): number {
    if (count === 0) return newValue;
    return (current * (count - 1) + newValue) / count;
  }
}

class ResourceMonitor {
  constructor(
    private config: AgentLifecycleConfig,
    private logger: ILogger
  ) {}

  // Resource monitoring implementation
}

class CapabilityDiscovery {
  constructor(private logger: ILogger) {}

  processOutput(agent: AgentInstance, data: string, stream: 'stdout' | 'stderr'): void {
    // Process agent output for capability discovery
    // This could parse structured output indicating capabilities
  }
}

class ScalingEngine {
  constructor(
    private config: AgentLifecycleConfig,
    private logger: ILogger
  ) {}

  async analyze(
    agents: Map<string, AgentInstance>,
    templates: Map<string, AgentTemplate>,
    metrics: LifecycleMetrics
  ): Promise<ScalingDecision> {
    // Simplified scaling analysis
    const totalAgents = metrics.totalAgents;
    const utilization = this.calculateUtilization(agents);

    if (utilization > 0.8 && totalAgents < this.config.maxAgents) {
      return {
        action: 'scale_up',
        targetCount: Math.min(totalAgents + 2, this.config.maxAgents),
        currentCount: totalAgents,
        reasoning: ['High utilization detected'],
        confidence: 0.8,
        urgency: 'medium',
      };
    } else if (utilization < 0.3 && totalAgents > this.config.minAgents) {
      return {
        action: 'scale_down',
        targetCount: Math.max(totalAgents - 1, this.config.minAgents),
        currentCount: totalAgents,
        reasoning: ['Low utilization detected'],
        confidence: 0.7,
        urgency: 'low',
      };
    }

    return {
      action: 'no_action',
      targetCount: totalAgents,
      currentCount: totalAgents,
      reasoning: ['Utilization within target range'],
      confidence: 0.9,
      urgency: 'low',
    };
  }

  private calculateUtilization(agents: Map<string, AgentInstance>): number {
    const activeAgents = Array.from(agents.values()).filter(
      (agent) => agent.status === 'busy' || agent.status === 'active'
    );

    const totalAgents = Array.from(agents.values()).filter(
      (agent) => agent.status !== 'terminated' && agent.status !== 'failed'
    );

    return totalAgents.length > 0 ? activeAgents.length / totalAgents.length : 0;
  }
}

class RecoveryEngine {
  constructor(
    private config: AgentLifecycleConfig,
    private logger: ILogger
  ) {}

  async recoverAgent(agent: AgentInstance, template: AgentTemplate): Promise<void> {
    // Implement agent recovery strategies
    this.logger.info('Attempting agent recovery', { agentId: agent.id });

    // For now, just mark as recovered (actual implementation would restart the agent)
    agent.health.overall = 0.8;
    agent.status = 'idle';
  }
}

export default AgentLifecycleManager;
