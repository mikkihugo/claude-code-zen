/**
 * Shared Interface Contracts
 *
 * Defines the contracts and abstractions that interfaces can depend on
 * without creating cross-interface dependencies.
 */

import type { 
  ProjectConfig, 
  CommandResult, 
  CommandContext,
  SystemHealth,
  ComponentStatus
} from './types.js';

/**
 * Project Management Contract
 * 
 * Abstract interface for project management operations that can be
 * implemented by different interface layers.
 */
export interface ProjectManagerContract {
  createProject(config: ProjectConfig): Promise<CommandResult>;
  optimizeProject(path: string): Promise<CommandResult>;
  getProjectStatus(path: string): Promise<SystemHealth>;
  listProjects(): Promise<ProjectSummary[]>;
}

export interface ProjectSummary {
  readonly name: string;
  readonly path: string;
  readonly type: string;
  readonly status: ComponentStatus;
  readonly lastModified: Date;
}

/**
 * Command Execution Contract
 * 
 * Abstract interface for command execution that can be implemented
 * by different command engines.
 */
export interface CommandExecutorContract {
  executeCommand(context: CommandContext): Promise<CommandResult>;
  isValidCommand(command: string): boolean;
  getCommandHelp(command?: string): string;
  getAvailableCommands(): string[];
}

/**
 * Swarm Coordination Contract
 * 
 * Abstract interface for swarm operations that interfaces can use
 * without depending on specific swarm implementations.
 */
export interface SwarmCoordinatorContract {
  initializeSwarm(config: SwarmConfig): Promise<CommandResult>;
  monitorSwarm(swarmId: string): Promise<SwarmStatus>;
  coordinateTask(task: SwarmTask): Promise<CommandResult>;
  terminateSwarm(swarmId: string): Promise<CommandResult>;
}

export interface SwarmConfig {
  readonly topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  readonly agentCount: number;
  readonly strategy: 'parallel' | 'sequential' | 'adaptive';
}

export interface SwarmStatus {
  readonly id: string;
  readonly status: 'active' | 'inactive' | 'error';
  readonly agents: number;
  readonly performance: number;
  readonly efficiency: number;
}

export interface SwarmTask {
  readonly description: string;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly strategy?: string;
  readonly timeout?: number;
}

/**
 * System Monitoring Contract
 * 
 * Abstract interface for system monitoring and health checks.
 */
export interface SystemMonitorContract {
  getSystemHealth(): Promise<SystemHealth>;
  getComponentStatus(component: string): Promise<ComponentStatus>;
  runHealthCheck(): Promise<CommandResult>;
  getMetrics(): Promise<SystemMetrics>;
}

export interface SystemMetrics {
  readonly cpu: number;
  readonly memory: number;
  readonly disk: number;
  readonly network: number;
  readonly uptime: number;
  readonly performance: PerformanceMetrics;
}

export interface PerformanceMetrics {
  readonly responseTime: number;
  readonly throughput: number;
  readonly errorRate: number;
  readonly availability: number;
}

/**
 * Data Service Contract
 * 
 * Abstract interface for data operations that interfaces can use.
 */
export interface DataServiceContract {
  getData<T>(key: string): Promise<T | null>;
  setData<T>(key: string, value: T): Promise<void>;
  removeData(key: string): Promise<void>;
  listKeys(pattern?: string): Promise<string[]>;
}

/**
 * Configuration Contract
 * 
 * Abstract interface for configuration management.
 */
export interface ConfigurationContract {
  getConfig<T>(key: string): T | undefined;
  setConfig<T>(key: string, value: T): void;
  loadConfig(path: string): Promise<void>;
  saveConfig(path: string): Promise<void>;
}