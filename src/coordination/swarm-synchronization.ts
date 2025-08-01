/**
 * Swarm Synchronization System
 *
 * Comprehensive synchronization strategy for distributed swarms ensuring consistency,
 * fault tolerance, and efficient coordination across all agents and Claude Code instances.
 */

import { EventEmitter } from 'node:events';
import type { IEventBus } from '../core/event-bus.js';
import type { ILogger } from '../core/logger.js';
import type { AgentState, AgentType } from '../types/agent-types.js';

export interface SwarmSyncConfig {
  syncInterval: number; // Milliseconds between sync cycles
  heartbeatInterval: number; // Agent heartbeat frequency
  consensusTimeout: number; // Max time to reach consensus
  maxSyncRetries: number; // Retry attempts for failed syncs
  enableDistributedLocks: boolean;
  enableEventualConsistency: boolean;
  enableByzantineFaultTolerance: boolean;
}

export interface SyncCheckpoint {
  id: string;
  timestamp: Date;
  swarmId: string;
  agentStates: Map<string, AgentState>;
  taskQueue: Task[];
  globalState: SwarmGlobalState;
  vectorClock: VectorClock;
  checksum: string;
}

export interface SwarmGlobalState {
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  averageResponseTime: number;
  systemHealth: number;
  resourceUtilization: ResourceMetrics;
  consensusRound: number;
}

export interface VectorClock {
  [agentId: string]: number;
}

export interface ResourceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  diskIO: number;
}

/**
 * Multi-layered synchronization system for distributed swarms
 */
export class SwarmSynchronizer extends EventEmitter {
  private config: SwarmSyncConfig;
  private swarmId: string;
  private agentStates = new Map<string, AgentState>();
  private vectorClock: VectorClock = {};
  private syncHistory: SyncCheckpoint[] = [];
  private distributedLocks = new Map<string, DistributedLock>();
  private consensusProtocol: ConsensusProtocol;
  private syncTimer?: NodeJS.Timeout;
  private heartbeatTimer?: NodeJS.Timeout;

  constructor(
    swarmId: string,
    config: Partial<SwarmSyncConfig> = {},
    private eventBus?: IEventBus,
    private logger?: ILogger
  ) {
    super();

    this.swarmId = swarmId;
    this.config = {
      syncInterval: 5000,
      heartbeatInterval: 2000,
      consensusTimeout: 10000,
      maxSyncRetries: 3,
      enableDistributedLocks: true,
      enableEventualConsistency: true,
      enableByzantineFaultTolerance: true,
      ...config,
    };

    this.consensusProtocol = new ConsensusProtocol(this.config, this.logger);
    this.setupEventHandlers();
  }

  /**
   * Start synchronization processes
   */
  async start(): Promise<void> {
    this.logger?.info('Starting swarm synchronization', { swarmId: this.swarmId });

    // Initialize vector clock
    this.vectorClock[this.swarmId] = 0;

    // Start periodic synchronization
    this.syncTimer = setInterval(() => {
      this.performSyncCycle().catch((error) => {
        this.logger?.error('Sync cycle failed', { error: error.message });
      });
    }, this.config.syncInterval);

    // Start heartbeat monitoring
    this.heartbeatTimer = setInterval(() => {
      this.checkAgentHeartbeats();
    }, this.config.heartbeatInterval);

    this.emit('sync:started', { swarmId: this.swarmId });
  }

  /**
   * Stop synchronization processes
   */
  async stop(): Promise<void> {
    this.logger?.info('Stopping swarm synchronization', { swarmId: this.swarmId });

    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }

    this.emit('sync:stopped', { swarmId: this.swarmId });
  }

  /**
   * Core synchronization cycle
   */
  private async performSyncCycle(): Promise<void> {
    const syncId = this.generateSyncId();
    const startTime = Date.now();

    try {
      // 1. Increment local vector clock
      this.vectorClock[this.swarmId]++;

      // 2. Gather local state
      const localState = await this.gatherLocalState();

      // 3. Broadcast state to peers
      await this.broadcastState(localState, syncId);

      // 4. Wait for peer responses
      const peerStates = await this.waitForPeerStates(syncId);

      // 5. Resolve conflicts and reach consensus
      const consensusState = await this.reachConsensus(localState, peerStates);

      // 6. Apply state changes
      await this.applyStateChanges(consensusState);

      // 7. Create checkpoint
      await this.createCheckpoint(consensusState);

      // 8. Notify completion
      this.emit('sync:completed', {
        swarmId: this.swarmId,
        syncId,
        duration: Date.now() - startTime,
        agentCount: consensusState.agentStates.size,
      });
    } catch (error) {
      this.logger?.error('Sync cycle failed', {
        swarmId: this.swarmId,
        syncId,
        error: error.message,
      });

      this.emit('sync:failed', {
        swarmId: this.swarmId,
        syncId,
        error: error.message,
      });
    }
  }

  /**
   * Gather current local swarm state
   */
  private async gatherLocalState(): Promise<SwarmLocalState> {
    const agentStates = new Map(this.agentStates);
    const globalMetrics = await this.calculateGlobalMetrics();

    return {
      swarmId: this.swarmId,
      timestamp: new Date(),
      vectorClock: { ...this.vectorClock },
      agentStates,
      globalState: globalMetrics,
      checksum: this.calculateStateChecksum(agentStates, globalMetrics),
    };
  }

  /**
   * Broadcast state to peer swarms
   */
  private async broadcastState(localState: SwarmLocalState, syncId: string): Promise<void> {
    if (!this.eventBus) return;

    this.eventBus.emit('swarm:sync:broadcast', {
      syncId,
      sourceSwarmId: this.swarmId,
      state: localState,
      timestamp: Date.now(),
    });
  }

  /**
   * Wait for peer swarm responses
   */
  private async waitForPeerStates(syncId: string): Promise<SwarmLocalState[]> {
    return new Promise((resolve) => {
      const peerStates: SwarmLocalState[] = [];
      const timeout = setTimeout(() => resolve(peerStates), this.config.consensusTimeout);

      const responseHandler = (data: any) => {
        if (data.syncId === syncId && data.sourceSwarmId !== this.swarmId) {
          peerStates.push(data.state);

          // If we have enough peers, resolve early
          if (peerStates.length >= 3) {
            clearTimeout(timeout);
            resolve(peerStates);
          }
        }
      };

      this.eventBus?.on('swarm:sync:response', responseHandler);

      // Cleanup listener after timeout
      setTimeout(() => {
        this.eventBus?.off('swarm:sync:response', responseHandler);
      }, this.config.consensusTimeout + 1000);
    });
  }

  /**
   * Reach consensus on global state
   */
  private async reachConsensus(
    localState: SwarmLocalState,
    peerStates: SwarmLocalState[]
  ): Promise<SwarmConsensusState> {
    if (this.config.enableByzantineFaultTolerance) {
      return await this.consensusProtocol.byzantineConsensus(localState, peerStates);
    } else {
      return await this.consensusProtocol.simpleConsensus(localState, peerStates);
    }
  }

  /**
   * Apply consensus state changes locally
   */
  private async applyStateChanges(consensusState: SwarmConsensusState): Promise<void> {
    // Update local agent states
    for (const [agentId, agentState] of consensusState.agentStates) {
      this.agentStates.set(agentId, agentState);
    }

    // Update vector clock
    this.vectorClock = consensusState.vectorClock;

    // Apply any pending tasks or state changes
    if (consensusState.pendingChanges) {
      await this.processPendingChanges(consensusState.pendingChanges);
    }

    this.emit('state:updated', {
      swarmId: this.swarmId,
      agentCount: consensusState.agentStates.size,
      globalState: consensusState.globalState,
    });
  }

  /**
   * Create synchronization checkpoint
   */
  private async createCheckpoint(consensusState: SwarmConsensusState): Promise<void> {
    const checkpoint: SyncCheckpoint = {
      id: this.generateCheckpointId(),
      timestamp: new Date(),
      swarmId: this.swarmId,
      agentStates: new Map(consensusState.agentStates),
      taskQueue: [...(consensusState.taskQueue || [])],
      globalState: { ...consensusState.globalState },
      vectorClock: { ...consensusState.vectorClock },
      checksum: consensusState.checksum,
    };

    this.syncHistory.push(checkpoint);

    // Keep only last 50 checkpoints
    if (this.syncHistory.length > 50) {
      this.syncHistory = this.syncHistory.slice(-50);
    }

    this.emit('checkpoint:created', {
      swarmId: this.swarmId,
      checkpointId: checkpoint.id,
      agentCount: checkpoint.agentStates.size,
    });
  }

  /**
   * Monitor agent heartbeats and handle failures
   */
  private checkAgentHeartbeats(): void {
    const now = Date.now();
    const staleAgents: string[] = [];

    for (const [agentId, agentState] of this.agentStates) {
      const timeSinceHeartbeat = now - agentState.lastHeartbeat.getTime();

      if (timeSinceHeartbeat > this.config.heartbeatInterval * 3) {
        staleAgents.push(agentId);
      }
    }

    if (staleAgents.length > 0) {
      this.handleStaleAgents(staleAgents);
    }
  }

  /**
   * Handle agents that have become unresponsive
   */
  private handleStaleAgents(staleAgents: string[]): void {
    for (const agentId of staleAgents) {
      const agentState = this.agentStates.get(agentId);
      if (agentState) {
        agentState.status = 'offline';
        this.logger?.warn('Agent marked as offline due to missed heartbeats', { agentId });
      }
    }

    this.emit('agents:stale', {
      swarmId: this.swarmId,
      staleAgents,
      totalAgents: this.agentStates.size,
    });
  }

  /**
   * Calculate global swarm metrics
   */
  private async calculateGlobalMetrics(): Promise<SwarmGlobalState> {
    const agents = Array.from(this.agentStates.values());
    const activeAgents = agents.filter((a) => a.status !== 'offline').length;

    return {
      activeAgents,
      totalTasks: agents.reduce((sum, a) => sum + a.taskHistory.length, 0),
      completedTasks: agents.reduce((sum, a) => sum + a.metrics.tasksCompleted, 0),
      averageResponseTime:
        agents.reduce((sum, a) => sum + a.metrics.responseTime, 0) / agents.length,
      systemHealth: (activeAgents / Math.max(agents.length, 1)) * 100,
      resourceUtilization: {
        cpuUsage: agents.reduce((sum, a) => sum + a.metrics.cpuUsage, 0) / agents.length,
        memoryUsage: agents.reduce((sum, a) => sum + a.metrics.memoryUsage, 0) / agents.length,
        networkLatency: 50, // Placeholder - would be measured
        diskIO: 0, // Placeholder - would be measured
      },
      consensusRound: this.vectorClock[this.swarmId] || 0,
    };
  }

  /**
   * Set up event handlers for synchronization
   */
  private setupEventHandlers(): void {
    if (!this.eventBus) return;

    // Handle sync broadcasts from other swarms
    this.eventBus.on('swarm:sync:broadcast', (data) => {
      if (data.sourceSwarmId !== this.swarmId) {
        this.handlePeerSyncBroadcast(data);
      }
    });

    // Handle agent state updates
    this.eventBus.on('agent:state:updated', (data) => {
      if (data.swarmId === this.swarmId) {
        this.updateAgentState(data.agentId, data.state);
      }
    });
  }

  /**
   * Handle sync broadcast from peer swarm
   */
  private handlePeerSyncBroadcast(data: any): void {
    // Respond with our current state
    if (this.eventBus) {
      this.eventBus.emit('swarm:sync:response', {
        syncId: data.syncId,
        sourceSwarmId: this.swarmId,
        state: this.gatherLocalState(),
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Update local agent state
   */
  private updateAgentState(agentId: string, newState: Partial<AgentState>): void {
    const currentState = this.agentStates.get(agentId);
    if (currentState) {
      const updatedState = { ...currentState, ...newState };
      this.agentStates.set(agentId, updatedState);

      // Increment vector clock for this update
      this.vectorClock[this.swarmId]++;
    }
  }

  /**
   * Get current synchronization status
   */
  getSyncStatus(): SwarmSyncStatus {
    return {
      swarmId: this.swarmId,
      isActive: !!this.syncTimer,
      lastSyncTime: this.syncHistory[this.syncHistory.length - 1]?.timestamp,
      agentCount: this.agentStates.size,
      activeAgents: Array.from(this.agentStates.values()).filter((a) => a.status !== 'offline')
        .length,
      vectorClock: { ...this.vectorClock },
      syncHistory: this.syncHistory.length,
    };
  }

  // Utility methods
  private generateSyncId(): string {
    return `sync_${this.swarmId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  private generateCheckpointId(): string {
    return `checkpoint_${this.swarmId}_${Date.now()}`;
  }

  private calculateStateChecksum(
    agentStates: Map<string, AgentState>,
    globalState: SwarmGlobalState
  ): string {
    const crypto = require('node:crypto');
    const data = JSON.stringify({ agentStates: Array.from(agentStates.entries()), globalState });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async processPendingChanges(changes: any[]): Promise<void> {
    // Process any pending state changes from consensus
    for (const change of changes) {
      try {
        await this.applyStateChange(change);
      } catch (error) {
        this.logger?.error('Failed to apply state change', { change, error: error.message });
      }
    }
  }

  private async applyStateChange(change: any): Promise<void> {
    // Implementation would depend on change type
    this.logger?.debug('Applying state change', { change });
  }
}

// Supporting interfaces and classes
interface SwarmLocalState {
  swarmId: string;
  timestamp: Date;
  vectorClock: VectorClock;
  agentStates: Map<string, AgentState>;
  globalState: SwarmGlobalState;
  checksum: string;
}

interface SwarmConsensusState extends SwarmLocalState {
  taskQueue?: Task[];
  pendingChanges?: any[];
}

interface SwarmSyncStatus {
  swarmId: string;
  isActive: boolean;
  lastSyncTime?: Date;
  agentCount: number;
  activeAgents: number;
  vectorClock: VectorClock;
  syncHistory: number;
}

interface DistributedLock {
  id: string;
  ownerId: string;
  expiresAt: Date;
  resource: string;
}

interface Task {
  id: string;
  assignedAgent?: string;
  status: string;
  priority: number;
}

/**
 * Consensus protocol implementation
 */
class ConsensusProtocol {
  constructor(
    private config: SwarmSyncConfig,
    private logger?: ILogger
  ) {}

  async byzantineConsensus(
    localState: SwarmLocalState,
    peerStates: SwarmLocalState[]
  ): Promise<SwarmConsensusState> {
    // Implement Byzantine fault-tolerant consensus
    // This is a simplified version - production would use proper BFT algorithm

    const allStates = [localState, ...peerStates];
    const majorityThreshold = Math.floor(allStates.length / 2) + 1;

    // Find consensus on agent states
    const consensusAgentStates = this.findAgentStateConsensus(allStates, majorityThreshold);

    // Merge vector clocks
    const consensusVectorClock = this.mergeVectorClocks(allStates.map((s) => s.vectorClock));

    return {
      ...localState,
      agentStates: consensusAgentStates,
      vectorClock: consensusVectorClock,
      globalState: await this.calculateConsensusGlobalState(allStates),
      checksum: this.calculateStateChecksum(consensusAgentStates, localState.globalState),
    };
  }

  async simpleConsensus(
    localState: SwarmLocalState,
    peerStates: SwarmLocalState[]
  ): Promise<SwarmConsensusState> {
    // Simple last-writer-wins consensus
    const allStates = [localState, ...peerStates];
    const latestState = allStates.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest
    );

    return {
      ...latestState,
      globalState: await this.calculateConsensusGlobalState(allStates),
    };
  }

  private findAgentStateConsensus(
    states: SwarmLocalState[],
    threshold: number
  ): Map<string, AgentState> {
    const consensusStates = new Map<string, AgentState>();
    const allAgentIds = new Set<string>();

    // Collect all agent IDs
    states.forEach((state) => {
      state.agentStates.forEach((_, agentId) => allAgentIds.add(agentId));
    });

    // For each agent, find consensus state
    for (const agentId of allAgentIds) {
      const agentStates = states
        .map((state) => state.agentStates.get(agentId))
        .filter(Boolean) as AgentState[];

      if (agentStates.length >= threshold) {
        // Use most recent state as consensus
        const consensusState = agentStates.reduce((latest, current) =>
          current.lastHeartbeat > latest.lastHeartbeat ? current : latest
        );
        consensusStates.set(agentId, consensusState);
      }
    }

    return consensusStates;
  }

  private mergeVectorClocks(vectorClocks: VectorClock[]): VectorClock {
    const merged: VectorClock = {};

    for (const clock of vectorClocks) {
      for (const [swarmId, version] of Object.entries(clock)) {
        merged[swarmId] = Math.max(merged[swarmId] || 0, version);
      }
    }

    return merged;
  }

  private async calculateConsensusGlobalState(
    states: SwarmLocalState[]
  ): Promise<SwarmGlobalState> {
    // Calculate consensus global state from all peer states
    // This is a simplified version - would implement proper consensus algorithm

    const latestState = states.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest
    );

    return latestState.globalState;
  }

  private calculateStateChecksum(
    agentStates: Map<string, AgentState>,
    globalState: SwarmGlobalState
  ): string {
    const crypto = require('node:crypto');
    const data = JSON.stringify({
      agentStates: Array.from(agentStates.entries()),
      globalState,
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

export default SwarmSynchronizer;
