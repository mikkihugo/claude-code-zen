/**
 * SPARC Template Engine - Database-Driven
 * 
 * Core template management system for SPARC methodology.
 * Provides template loading, application, validation, and customization.
 * Integrated with claude-code-zen's multi-backend memory system.
 */

import { nanoid } from 'nanoid';
import type {
  ProjectSpecification,
  DetailedSpecification,
  PseudocodeStructure,
  ArchitectureDesign,
  ProjectDomain,
  SPARCTemplate,
} from '../types/sparc-types';

// Import memory backend infrastructure
import { BackendFactory } from '../../../../memory/backends/factory';
import type { BackendInterface, BackendConfig } from '../../../../memory/backends/memory-backend';

// Import all available templates
import { MEMORY_SYSTEMS_TEMPLATE } from '../templates/memory-systems-template';
import { NEURAL_NETWORKS_TEMPLATE } from '../templates/neural-networks-template';
import { REST_API_TEMPLATE } from '../templates/rest-api-template';
import { SWARM_COORDINATION_TEMPLATE } from '../templates/swarm-coordination-template';

export interface TemplateApplicationResult {
  specification: DetailedSpecification;
  pseudocode: PseudocodeStructure;
  architecture: ArchitectureDesign;
  templateId: string;
  customizations: string[];
  warnings: string[];
}

export interface TemplateValidationResult {
  compatible: boolean;
  warnings: string[];
  recommendations: string[];
  score: number; // 0-1 compatibility score
}

export interface TemplateRegistryEntry {
  template: SPARCTemplate;
  metadata: {
    registeredAt: Date;
    usageCount: number;
    averageRating: number;
    lastUsed?: Date;
  };
}

export interface TemplateEngineConfig {
  backend: BackendConfig;
  namespace?: string;
  cacheSize?: number;
}

/**
 * Database-driven template engine for SPARC methodology
 * Uses claude-code-zen's multi-backend memory system for persistence
 */
export class TemplateEngine {
  private readonly backend: BackendInterface;
  private readonly namespace: string;
  private readonly templateCache: Map<string, TemplateRegistryEntry>;
  private readonly domainMappingsCache: Map<ProjectDomain, string[]>;

  constructor(config?: TemplateEngineConfig) {
    // Use default SQLite backend if no config provided
    const backendConfig = config?.backend || {
      type: 'sqlite' as const,
      path: './data/sparc-templates.db',
      enabled: true,
    };

    this.backend = BackendFactory.create(backendConfig);
    this.namespace = config?.namespace || 'sparc-templates';
    this.templateCache = new Map();
    this.domainMappingsCache = new Map();
  }

  /**
   * Initialize the template engine and database backend
   */
  async initialize(): Promise<void> {
    await this.backend.initialize();
    await this.loadTemplatesFromDatabase();
    await this.initializeTemplateRegistry();
  }

  /**
   * Load existing templates from database into cache
   */
  private async loadTemplatesFromDatabase(): Promise<void> {
    try {
      // Load template registry
      const registryData = await this.backend.retrieve('template-registry', this.namespace);
      if (registryData && typeof registryData === 'object') {
        const registry = registryData as Record<string, TemplateRegistryEntry>;
        for (const [id, entry] of Object.entries(registry)) {
          this.templateCache.set(id, {
            ...entry,
            metadata: {
              ...entry.metadata,
              registeredAt: new Date(entry.metadata.registeredAt),
              lastUsed: entry.metadata.lastUsed ? new Date(entry.metadata.lastUsed) : undefined,
            },
          });
        }
      }

      // Load domain mappings
      const mappingsData = await this.backend.retrieve('domain-mappings', this.namespace);
      if (mappingsData && typeof mappingsData === 'object') {
        const mappings = mappingsData as Record<string, string[]>;
        for (const [domain, templateIds] of Object.entries(mappings)) {
          this.domainMappingsCache.set(domain as ProjectDomain, templateIds);
        }
      }

      console.log(`📋 Loaded ${this.templateCache.size} templates from database`);
    } catch (error) {
      console.warn('⚠️ Could not load templates from database, will use defaults:', error);
    }
  }

  /**
   * Save template registry to database
   */
  private async saveTemplateRegistry(): Promise<void> {
    try {
      const registryData: Record<string, TemplateRegistryEntry> = {};
      for (const [id, entry] of this.templateCache.entries()) {
        registryData[id] = entry;
      }

      await this.backend.store('template-registry', registryData, this.namespace);

      // Save domain mappings
      const mappingsData: Record<string, string[]> = {};
      for (const [domain, templateIds] of this.domainMappingsCache.entries()) {
        mappingsData[domain] = templateIds;
      }

      await this.backend.store('domain-mappings', mappingsData, this.namespace);
    } catch (error) {
      console.error('❌ Failed to save template registry to database:', error);
    }
  }
  /**
   * Initialize template registry with all available templates (if not already loaded)
   */
  private async initializeTemplateRegistry(): Promise<void> {
    // Only initialize if we don't have templates loaded from database
    if (this.templateCache.size === 0) {
      const templates = [
        MEMORY_SYSTEMS_TEMPLATE,
        NEURAL_NETWORKS_TEMPLATE,
        REST_API_TEMPLATE,
        SWARM_COORDINATION_TEMPLATE,
      ];

      for (const template of templates) {
        await this.registerTemplate(template);
      }
    }

    // Initialize domain mappings if not loaded from database
    if (this.domainMappingsCache.size === 0) {
      this.domainMappingsCache.set('memory-systems', ['memory-systems-template']);
      this.domainMappingsCache.set('neural-networks', ['neural-networks-template']);
      this.domainMappingsCache.set('rest-api', ['rest-api-template']);
      this.domainMappingsCache.set('swarm-coordination', ['swarm-coordination-template']);
      this.domainMappingsCache.set('general', ['memory-systems-template', 'rest-api-template']);

      // Save initial mappings to database
      await this.saveTemplateRegistry();
    }
  }

  /**
   * Register a new template with the engine and persist to database
   */
  async registerTemplate(template: SPARCTemplate): Promise<void> {
    const entry: TemplateRegistryEntry = {
      template,
      metadata: {
        registeredAt: new Date(),
        usageCount: 0,
        averageRating: 0,
      },
    };

    this.templateCache.set(template.id, entry);
    await this.saveTemplateRegistry();
    
    console.log(`📋 Registered SPARC template: ${template.name} (${template.id}) [Database-backed]`);
  }

  /**
   * Get all available templates
   */
  getAllTemplates(): SPARCTemplate[] {
    return Array.from(this.templateCache.values()).map(entry => entry.template);
  }

  /**
   * Get templates by domain
   */
  getTemplatesByDomain(domain: ProjectDomain): SPARCTemplate[] {
    const templateIds = this.domainMappingsCache.get(domain) || [];
    return templateIds
      .map(id => this.templateCache.get(id)?.template)
      .filter((template): template is SPARCTemplate => template !== undefined);
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): SPARCTemplate | null {
    return this.templateCache.get(templateId)?.template || null;
  }

  /**
   * Find best matching template for a project specification
   */
  findBestTemplate(projectSpec: ProjectSpecification): {
    template: SPARCTemplate;
    compatibility: TemplateValidationResult;
  } | null {
    const domainTemplates = this.getTemplatesByDomain(projectSpec.domain);
    
    if (domainTemplates.length === 0) {
      console.warn(`⚠️ No templates found for domain: ${projectSpec.domain}`);
      return null;
    }

    let bestMatch: { template: SPARCTemplate; compatibility: TemplateValidationResult } | null = null;
    let bestScore = 0;

    for (const template of domainTemplates) {
      const compatibility = this.validateTemplateCompatibility(template, projectSpec);
      
      if (compatibility.compatible && compatibility.score > bestScore) {
        bestScore = compatibility.score;
        bestMatch = { template, compatibility };
      }
    }

    return bestMatch;
  }

  /**
   * Validate template compatibility with project specification
   */
  validateTemplateCompatibility(
    template: SPARCTemplate,
    projectSpec: ProjectSpecification
  ): TemplateValidationResult {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let score = 1.0; // Start with perfect score

    // Check domain compatibility
    if (template.domain !== projectSpec.domain) {
      warnings.push(`Template domain (${template.domain}) doesn't match project domain (${projectSpec.domain})`);
      score -= 0.3;
    }

    // Check complexity compatibility
    const templateComplexity = template.metadata.complexity;
    const projectComplexity = projectSpec.complexity;
    
    if (templateComplexity === 'high' && projectComplexity === 'simple') {
      warnings.push('Template complexity may be higher than needed for simple project');
      recommendations.push('Consider simplifying template components');
      score -= 0.2;
    } else if (templateComplexity === 'simple' && projectComplexity === 'enterprise') {
      warnings.push('Template may be too simple for enterprise complexity');
      recommendations.push('Consider adding enterprise features');
      score -= 0.1;
    }

    // Check requirement coverage
    const templateRequirements = this.extractTemplateRequirements(template);
    const projectRequirements = projectSpec.requirements || [];
    
    const coverageScore = this.calculateRequirementCoverage(templateRequirements, projectRequirements);
    score = score * 0.7 + coverageScore * 0.3; // Weight the scores

    if (coverageScore < 0.7) {
      warnings.push('Template may not cover all project requirements');
      recommendations.push('Review and customize template to match specific requirements');
    }

    const compatible = score >= 0.6; // Minimum 60% compatibility required

    return {
      compatible,
      warnings,
      recommendations,
      score,
    };
  }

  /**
   * Apply template to project specification with database persistence
   */
  async applyTemplate(
    template: SPARCTemplate,
    projectSpec: ProjectSpecification
  ): Promise<TemplateApplicationResult> {
    console.log(`🔧 Applying template: ${template.name} to project: ${projectSpec.name} [Database-backed]`);

    // Update usage statistics in cache and database
    const entry = this.templateCache.get(template.id);
    if (entry) {
      entry.metadata.usageCount++;
      entry.metadata.lastUsed = new Date();
      
      // Persist updated stats to database
      await this.saveTemplateRegistry();
    }

    // Apply template using the template's own applyTo method
    const applied = await template.applyTo(projectSpec);

    // Generate unique IDs and update metadata
    const customizedSpec = {
      ...applied.specification,
      id: nanoid(),
      name: projectSpec.name,
      domain: projectSpec.domain,
    };

    const customizedPseudocode = {
      ...applied.pseudocode,
      id: nanoid(),
      specificationId: customizedSpec.id,
    };

    const customizedArchitecture = {
      ...applied.architecture,
      id: nanoid(),
      pseudocodeId: customizedPseudocode.id,
    };

    // Generate customization report
    const customizations = this.generateCustomizationReport(template, projectSpec);
    
    // Validate the applied template
    const validation = this.validateTemplateCompatibility(template, projectSpec);

    // Store the complete application result in database for future reference
    const applicationId = `app-${nanoid()}`;
    await this.backend.store(`application-${applicationId}`, {
      result: {
        specification: customizedSpec,
        pseudocode: customizedPseudocode,
        architecture: customizedArchitecture,
        templateId: template.id,
        customizations,
        warnings: validation.warnings,
      },
      projectSpec,
      appliedAt: new Date(),
    }, this.namespace);

    console.log(`✅ Template application completed with ${customizations.length} customizations [Stored: ${applicationId}]`);

    return {
      specification: customizedSpec,
      pseudocode: customizedPseudocode,
      architecture: customizedArchitecture,
      templateId: template.id,
      customizations,
      warnings: validation.warnings,
    };
  }

  /**
   * Create custom template from project specification
   */
  async createCustomTemplate(
    projectSpec: ProjectSpecification,
    baseTemplateId?: string
  ): Promise<SPARCTemplate> {
    console.log(`🎨 Creating custom template for project: ${projectSpec.name}`);

    let baseTemplate: SPARCTemplate | null = null;
    if (baseTemplateId) {
      baseTemplate = this.getTemplate(baseTemplateId);
    } else {
      // Find best matching template as base
      const bestMatch = this.findBestTemplate(projectSpec);
      baseTemplate = bestMatch?.template || null;
    }

    const customTemplateId = `custom-${projectSpec.domain}-${nanoid()}`;
    
    // Create basic template structure
    const customTemplate: SPARCTemplate = {
      id: customTemplateId,
      name: `Custom ${projectSpec.name} Template`,
      domain: projectSpec.domain,
      description: `Custom template generated for ${projectSpec.name}`,
      version: '1.0.0',
      metadata: {
        author: 'SPARC Template Engine',
        createdAt: new Date(),
        tags: [projectSpec.domain, projectSpec.complexity, 'custom'],
        complexity: projectSpec.complexity,
        estimatedDevelopmentTime: this.estimateDevelopmentTime(projectSpec),
        targetPerformance: 'Optimized for project requirements',
      },

      // Use base template structure or create minimal structure
      specification: baseTemplate?.specification || this.createMinimalSpecification(projectSpec),
      pseudocode: baseTemplate?.pseudocode || this.createMinimalPseudocode(projectSpec),
      architecture: baseTemplate?.architecture || this.createMinimalArchitecture(projectSpec),

      async applyTo(spec: ProjectSpecification) {
        return {
          specification: this.customizeSpecification(spec),
          pseudocode: this.customizePseudocode(spec),
          architecture: this.customizeArchitecture(spec),
        };
      },

      customizeSpecification: baseTemplate?.customizeSpecification || ((spec) => this.createMinimalSpecification(spec)),
      customizePseudocode: baseTemplate?.customizePseudocode || ((spec) => this.createMinimalPseudocode(spec)),
      customizeArchitecture: baseTemplate?.customizeArchitecture || ((spec) => this.createMinimalArchitecture(spec)),

      validateCompatibility: baseTemplate?.validateCompatibility || ((spec) => ({
        compatible: true,
        warnings: [],
        recommendations: [],
      })),
    };

    // Register the custom template and persist to database
    await this.registerTemplate(customTemplate);

    console.log(`✅ Custom template created and stored in database: ${customTemplate.id}`);
    return customTemplate;
  }

  /**
   * Get template usage statistics from database-backed data
   */
  async getTemplateStats(): Promise<{
    totalTemplates: number;
    domainCoverage: Record<string, number>;
    mostUsed: string[];
    recentlyUsed: string[];
    databaseInfo: {
      backend: string;
      namespace: string;
      lastSync: Date;
    };
  }> {
    const stats = {
      totalTemplates: this.templateCache.size,
      domainCoverage: {} as Record<string, number>,
      mostUsed: [] as string[],
      recentlyUsed: [] as string[],
      databaseInfo: {
        backend: this.backend.constructor.name,
        namespace: this.namespace,
        lastSync: new Date(),
      },
    };

    // Calculate domain coverage
    for (const [domain, templateIds] of Array.from(this.domainMappingsCache.entries())) {
      stats.domainCoverage[domain] = templateIds.length;
    }

    // Get most used templates
    const entriesByUsage = Array.from(this.templateCache.entries())
      .sort((a, b) => b[1].metadata.usageCount - a[1].metadata.usageCount);
    stats.mostUsed = entriesByUsage.slice(0, 5).map(([id, _]) => id);

    // Get recently used templates
    const entriesByRecent = Array.from(this.templateCache.entries())
      .filter(([_, entry]) => entry.metadata.lastUsed)
      .sort((a, b) => (b[1].metadata.lastUsed!.getTime() - a[1].metadata.lastUsed!.getTime()));
    stats.recentlyUsed = entriesByRecent.slice(0, 5).map(([id, _]) => id);

    return stats;
  }

  /**
   * Get backend health and database status
   */
  async getDatabaseStatus(): Promise<{
    backend: string;
    healthy: boolean;
    stats: any;
    templateCount: number;
    namespace: string;
  }> {
    try {
      const backendStats = await this.backend.getStats();
      const healthCheck = this.backend.healthCheck ? await this.backend.healthCheck() : null;

      return {
        backend: this.backend.constructor.name,
        healthy: !healthCheck || healthCheck.status === 'healthy',
        stats: backendStats,
        templateCount: this.templateCache.size,
        namespace: this.namespace,
      };
    } catch (error) {
      return {
        backend: this.backend.constructor.name,
        healthy: false,
        stats: { error: String(error) },
        templateCount: this.templateCache.size,
        namespace: this.namespace,
      };
    }
  }

  // Private helper methods

  private extractTemplateRequirements(template: SPARCTemplate): string[] {
    const requirements: string[] = [];
    
    // Extract from functional requirements
    if (template.specification.functionalRequirements) {
      requirements.push(...template.specification.functionalRequirements.map(req => req.title));
    }

    // Extract from template metadata tags
    if (template.metadata.tags) {
      requirements.push(...template.metadata.tags);
    }

    return requirements;
  }

  private calculateRequirementCoverage(
    templateRequirements: string[],
    projectRequirements: string[]
  ): number {
    if (projectRequirements.length === 0) {
      return 1.0; // Perfect score if no specific requirements
    }

    let matches = 0;
    for (const projectReq of projectRequirements) {
      const found = templateRequirements.some(templateReq =>
        templateReq.toLowerCase().includes(projectReq.toLowerCase()) ||
        projectReq.toLowerCase().includes(templateReq.toLowerCase())
      );
      if (found) matches++;
    }

    return matches / projectRequirements.length;
  }

  private generateCustomizationReport(
    template: SPARCTemplate,
    projectSpec: ProjectSpecification
  ): string[] {
    const customizations: string[] = [];

    if (template.domain !== projectSpec.domain) {
      customizations.push(`Adapted from ${template.domain} to ${projectSpec.domain} domain`);
    }

    if (projectSpec.constraints && projectSpec.constraints.length > 0) {
      customizations.push(`Added ${projectSpec.constraints.length} project-specific constraints`);
    }

    if (projectSpec.requirements && projectSpec.requirements.length > 0) {
      customizations.push(`Integrated ${projectSpec.requirements.length} custom requirements`);
    }

    customizations.push(`Updated project name to: ${projectSpec.name}`);
    customizations.push(`Set complexity level to: ${projectSpec.complexity}`);

    return customizations;
  }

  private estimateDevelopmentTime(projectSpec: ProjectSpecification): string {
    const complexityMultipliers = {
      simple: 1,
      moderate: 2,
      high: 3,
      complex: 4,
      enterprise: 6,
    };

    const baseWeeks = 2;
    const multiplier = complexityMultipliers[projectSpec.complexity] || 2;
    const estimatedWeeks = baseWeeks * multiplier;

    return `${estimatedWeeks}-${estimatedWeeks + 2} weeks`;
  }

  private createMinimalSpecification(projectSpec: ProjectSpecification): DetailedSpecification {
    return {
      id: nanoid(),
      domain: projectSpec.domain,
      functionalRequirements: projectSpec.requirements?.map(req => ({
        id: nanoid(),
        title: req,
        description: `Requirement: ${req}`,
        type: 'functional',
        priority: 'MEDIUM' as const,
        testCriteria: [`Implements ${req} successfully`],
      })) || [],
      nonFunctionalRequirements: [],
      constraints: projectSpec.constraints?.map(constraint => ({
        id: nanoid(),
        type: 'business' as const,
        description: constraint,
        impact: 'medium' as const,
      })) || [],
      assumptions: [],
      dependencies: [],
      acceptanceCriteria: [],
      riskAssessment: {
        risks: [],
        mitigationStrategies: [],
        overallRisk: 'LOW' as const,
      },
      successMetrics: [],
    };
  }

  private createMinimalPseudocode(projectSpec: ProjectSpecification): PseudocodeStructure {
    return {
      id: nanoid(),
      algorithms: [],
      coreAlgorithms: [],
      dataStructures: [],
      controlFlows: [],
      optimizations: [],
      dependencies: [],
      complexityAnalysis: {
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        scalability: `Designed for ${projectSpec.complexity} complexity`,
        worstCase: 'TBD',
        bottlenecks: [],
      },
    };
  }

  private createMinimalArchitecture(projectSpec: ProjectSpecification): ArchitectureDesign {
    return {
      id: nanoid(),
      components: [],
      securityRequirements: [],
      scalabilityRequirements: [],
      qualityAttributes: [],
      systemArchitecture: {
        components: [],
        interfaces: [],
        dataFlow: [],
        deploymentUnits: [],
        qualityAttributes: [],
        architecturalPatterns: [],
        technologyStack: [],
      },
      componentDiagrams: [],
      dataFlow: [],
      deploymentPlan: [],
      validationResults: [],
    };
  }
}

// Export singleton instance with database backend configuration
export const templateEngine = new TemplateEngine({
  backend: {
    type: 'sqlite',
    path: './data/sparc-templates.db',
    enabled: true,
  },
  namespace: 'sparc-templates',
  cacheSize: 100,
});

// Initialize the template engine on first import
templateEngine.initialize().catch(error => {
  console.error('❌ Failed to initialize SPARC template engine:', error);
});