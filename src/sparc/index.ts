/**
 * SPARC Methodology System - Main Export
 * 
 * Comprehensive SPARC (Specification, Pseudocode, Architecture, Refinement, Completion)
 * methodology system for systematic AI-assisted development workflow.
 */

// Core Engine
export { SPARCEngineCore } from './core/sparc-engine.js';

// Phase Engines
export { SpecificationPhaseEngine } from './phases/specification/specification-engine.js';

// Types
export type * from './types/sparc-types.js';

// MCP Integration
export { sparcMCPTools, SPARCMCPTools } from './integrations/mcp-sparc-tools.js';

// Templates
export { SWARM_COORDINATION_TEMPLATE } from './templates/swarm-coordination-template.js';

// Main SPARC facade for easy usage
export class SPARC {
  private static instance: SPARCEngineCore;

  /**
   * Get singleton SPARC engine instance
   */
  static getEngine(): SPARCEngineCore {
    if (!this.instance) {
      this.instance = new SPARCEngineCore();
    }
    return this.instance;
  }

  /**
   * Quick project initialization with SPARC methodology
   */
  static async createProject(
    name: string,
    domain: 'swarm-coordination' | 'neural-networks' | 'wasm-integration' | 'rest-api' | 'memory-systems' | 'interfaces' | 'general',
    requirements: string[],
    complexity: 'simple' | 'moderate' | 'high' | 'complex' | 'enterprise' = 'moderate'
  ) {
    const engine = this.getEngine();
    return engine.initializeProject({
      name,
      domain,
      complexity,
      requirements
    });
  }

  /**
   * Execute complete SPARC workflow
   */
  static async executeFullWorkflow(projectId: string) {
    const engine = this.getEngine();
    const phases = ['specification', 'pseudocode', 'architecture', 'refinement', 'completion'] as const;
    
    const results = [];
    for (const phase of phases) {
      const project = await this.getProject(projectId);
      const result = await engine.executePhase(project, phase);
      results.push(result);
    }

    return results;
  }

  /**
   * Get project by ID (mock implementation)
   */
  private static async getProject(projectId: string) {
    // In a real implementation, this would retrieve from storage
    throw new Error(`Project retrieval not implemented for ID: ${projectId}`);
  }
}

export default SPARC;