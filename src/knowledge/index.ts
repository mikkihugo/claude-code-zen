/**
 * Cross-Agent Knowledge Sharing Index
 * Central export point for all collective intelligence and knowledge sharing systems
 */

// Collaborative Reasoning Types
export type {
  CollaborativeSolution,
  ComprehensiveSolution,
  ConsensusResult,
  DistributedReasoningResult,
  Problem,
  ProblemDecomposition,
} from './collaborative-reasoning-engine';
export { CollaborativeReasoningEngine } from './collaborative-reasoning-engine';
// Collective Intelligence Types
export type {
  AgentContribution,
  AggregatedKnowledge,
  CollectiveDecision,
  DecisionContext,
  KnowledgeExchangeProtocol,
  KnowledgePacket,
  WorkDistributionResult,
} from './collective-intelligence-coordinator';
// Core Collective Intelligence Systems
export { CollectiveIntelligenceCoordinator } from './collective-intelligence-coordinator';
// Type Definitions - Main Configuration Types
// Type Definitions - Result Types
// Type Definitions - Request Types
export type {
  CollaborativeReasoningConfig,
  CollectiveIntelligenceConfig,
  CollectiveKnowledgeResponse,
  CollectiveProcessingOptions,
  ComponentHealth,
  CrossAgentKnowledgeConfig,
  CrossDomainTransferRequest,
  CrossDomainTransferResult,
  DistributedLearningConfig,
  DistributedLearningRequest,
  DistributedLearningResult,
  FACTIntegrationConfig,
  IntegrationConfig,
  IntegrationMetrics,
  IntegrationStatus,
  IntelligenceCoordinationConfig,
  KnowledgeProcessingResult,
  KnowledgeQualityConfig,
  KnowledgeQuery,
  PerformanceOptimizationConfig,
  RAGIntegrationConfig,
  SystemStatus,
} from './cross-agent-knowledge-integration';
// Main Integration System
export {
  CrossAgentKnowledgeIntegration,
  createCrossAgentKnowledgeIntegration,
  getDefaultConfig as getDefaultKnowledgeConfig,
} from './cross-agent-knowledge-integration';
// Distributed Learning Types
export type {
  CollectiveExperienceAggregation,
  FederatedLearningRound,
  KnowledgeTransferResult,
  ModelSnapshot,
  ModelSynchronizationResult,
} from './distributed-learning-system';
export { DistributedLearningSystem } from './distributed-learning-system';
// Intelligence Coordination Types
export type {
  CrossDomainTransferResult as IntelligenceTransferResult,
  ExpertiseDiscoveryResult,
  ExpertiseProfile,
  RoutingResult,
  SpecializationEmergenceResult,
} from './intelligence-coordination-system';
export { IntelligenceCoordinationSystem } from './intelligence-coordination-system';
export { KnowledgeClient } from './knowledge-client';
export { KnowledgeProcessor } from './knowledge-processor';
// Quality Management Types
export type {
  ContributionRecord,
  KnowledgeItem,
  QualityMonitoringReport,
  ReputationScore,
  ReviewResult,
  ValidationResult,
} from './knowledge-quality-management';
export { KnowledgeQualityManagementSystem } from './knowledge-quality-management';
export { KnowledgeStorage } from './knowledge-storage';
// Existing Knowledge System Types
export type {
  FACTResult,
  KnowledgeSwarmConfig,
  SwarmAgent,
  SwarmQuery,
  SwarmResult,
} from './knowledge-swarm';
// Existing Knowledge Systems (for integration)
export { KnowledgeSwarm } from './knowledge-swarm';
// Performance Optimization Types
export type {
  CacheOptimizationResult,
  KnowledgeRequest,
  KnowledgeSharingOptimization,
  KnowledgeSharingRequest,
  OptimizedKnowledgeResponse,
} from './performance-optimization-system';
export { PerformanceOptimizationSystem } from './performance-optimization-system';
export { ProjectContextAnalyzer } from './project-context-analyzer';
// Storage Backends
export { SQLiteBackend } from './storage-backends/sqlite-backend';
export { StorageInterface } from './storage-interface';

/**
 * Factory Functions for Easy System Creation
 */

/**
 * Create a complete cross-agent knowledge sharing system
 */
export async function createKnowledgeSharingSystem(
  config?: Partial<CrossAgentKnowledgeConfig>,
  logger?: any,
  eventBus?: any
): Promise<CrossAgentKnowledgeIntegration> {
  const { CrossAgentKnowledgeIntegration, getDefaultConfig } = await import(
    './cross-agent-knowledge-integration'
  );

  // Use provided config or create default
  const finalConfig = config ? { ...getDefaultConfig(), ...config } : getDefaultConfig();

  // Create logger and event bus if not provided
  const finalLogger = logger || console;
  const finalEventBus = eventBus || new (await import('events')).EventEmitter();

  const system = new CrossAgentKnowledgeIntegration(finalConfig, finalLogger, finalEventBus);
  await system.initialize();

  return system;
}

/**
 * Create a knowledge swarm system
 */
export async function createKnowledgeSwarm(config?: any, vectorDb?: any): Promise<any> {
  const { initializeFACTSwarm } = await import('./knowledge-swarm');
  return initializeFACTSwarm(config, vectorDb);
}

/**
 * Utility Functions
 */

/**
 * Validate cross-agent knowledge configuration
 */
export function validateKnowledgeConfig(config: CrossAgentKnowledgeConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate collective intelligence config
  if (!config.collectiveIntelligence) {
    errors.push('Missing collectiveIntelligence configuration');
  }

  // Validate integration config
  if (!config.integration) {
    errors.push('Missing integration configuration');
  } else {
    if (
      config.integration.factIntegration.enabled &&
      !config.integration.factIntegration.knowledgeSwarmIntegration
    ) {
      warnings.push('FACT integration enabled but knowledge swarm integration disabled');
    }

    if (
      config.integration.ragIntegration.enabled &&
      !config.integration.ragIntegration.vectorStoreIntegration
    ) {
      warnings.push('RAG integration enabled but vector store integration disabled');
    }
  }

  // Validate distributed learning config
  if (config.distributedLearning && config.distributedLearning.federatedConfig) {
    const fedConfig = config.distributedLearning.federatedConfig;
    if (fedConfig.clientFraction > 1.0 || fedConfig.clientFraction <= 0) {
      errors.push('federatedConfig.clientFraction must be between 0 and 1');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get system capabilities based on configuration
 */
export function getSystemCapabilities(config: CrossAgentKnowledgeConfig): {
  collectiveIntelligence: boolean;
  distributedLearning: boolean;
  collaborativeReasoning: boolean;
  crossDomainTransfer: boolean;
  qualityManagement: boolean;
  performanceOptimization: boolean;
  factIntegration: boolean;
  ragIntegration: boolean;
} {
  return {
    collectiveIntelligence: !!config.collectiveIntelligence,
    distributedLearning: !!config.distributedLearning,
    collaborativeReasoning: !!config.collaborativeReasoning,
    crossDomainTransfer: !!config.intelligenceCoordination,
    qualityManagement: !!config.qualityManagement,
    performanceOptimization: !!config.performanceOptimization,
    factIntegration: config.integration?.factIntegration?.enabled || false,
    ragIntegration: config.integration?.ragIntegration?.enabled || false,
  };
}

/**
 * Helper function to create minimal configuration for testing
 */
export function createTestConfig(): CrossAgentKnowledgeConfig {
  const defaultConfig = getDefaultConfig();

  return {
    ...defaultConfig,
    integration: {
      ...defaultConfig.integration,
      factIntegration: {
        ...defaultConfig.integration.factIntegration,
        enabled: false, // Disable for testing
      },
      ragIntegration: {
        ...defaultConfig.integration.ragIntegration,
        enabled: false, // Disable for testing
      },
    },
  };
}

/**
 * Storage and Persistence Utilities
 */

/**
 * Check if storage directory exists and create if needed
 */
export async function ensureStorageDirectory(basePath: string = process.cwd()): Promise<{
  swarmDir: string;
  hiveMindDir: string;
  knowledgeDir: string;
  cacheDir: string;
}> {
  const path = await import('path');
  const fs = await import('fs/promises');

  const swarmDir = path.join(basePath, '.swarm');
  const hiveMindDir = path.join(basePath, '.hive-mind');
  const knowledgeDir = path.join(basePath, '.knowledge');
  const cacheDir = path.join(basePath, '.cache', 'knowledge');

  // Create directories if they don't exist
  await fs.mkdir(swarmDir, { recursive: true });
  await fs.mkdir(hiveMindDir, { recursive: true });
  await fs.mkdir(knowledgeDir, { recursive: true });
  await fs.mkdir(cacheDir, { recursive: true });

  return {
    swarmDir,
    hiveMindDir,
    knowledgeDir,
    cacheDir,
  };
}

/**
 * Get storage paths for knowledge systems
 */
export function getKnowledgeStoragePaths(basePath: string = process.cwd()): {
  collective: string;
  distributed: string;
  collaborative: string;
  intelligence: string;
  quality: string;
  performance: string;
} {
  const path = require('path');

  return {
    collective: path.join(basePath, '.hive-mind', 'collective-intelligence'),
    distributed: path.join(basePath, '.swarm', 'distributed-learning'),
    collaborative: path.join(basePath, '.hive-mind', 'collaborative-reasoning'),
    intelligence: path.join(basePath, '.swarm', 'intelligence-coordination'),
    quality: path.join(basePath, '.knowledge', 'quality-management'),
    performance: path.join(basePath, '.cache', 'performance-optimization'),
  };
}

/**
 * Default Export - Main Integration System Class
 */
export type { CrossAgentKnowledgeIntegration as default };
