/**
 * SPARC Integration with Project Management Artifacts
 * 
 * Integrates SPARC methodology with existing project management infrastructure:
 * - ADRs (Architecture Decision Records)
 * - PRDs (Product Requirements Documents)  
 * - Tasks (tasks.json)
 * - Features, Epics, Roadmaps
 */

import { SPARCProject, DetailedSpecification } from '../types/sparc-types';
import * as fs from 'fs/promises';
import * as path from 'path';

// Task Management Integration Types
export interface Task {
  id: string;
  title: string;
  component: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  priority: number;
  estimated_hours: number;
  actual_hours: number | null;
  dependencies: string[];
  acceptance_criteria: string[];
  notes: string;
  assigned_to: string;
  created_date: string;
  completed_date: string | null;
  sparc_project_id?: string; // Link to SPARC project
}

// ADR Integration Types
export interface ADR {
  id: string;
  title: string;
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  context: string;
  decision: string;
  consequences: string[];
  date: string;
  sparc_project_id?: string;
  phase: 'specification' | 'architecture' | 'refinement' | 'completion';
}

// PRD Integration Types
export interface PRD {
  id: string;
  title: string;
  version: string;
  overview: string;
  objectives: string[];
  success_metrics: string[];
  user_stories: UserStory[];
  functional_requirements: string[];
  non_functional_requirements: string[];
  constraints: string[];
  dependencies: string[];
  timeline: string;
  stakeholders: string[];
  sparc_project_id?: string;
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptance_criteria: string[];
  priority: 'high' | 'medium' | 'low';
  effort_estimate: number;
}

// Feature and Epic Types
export interface Feature {
  id: string;
  title: string;
  description: string;
  epic_id?: string;
  user_stories: string[]; // References to user story IDs
  status: 'backlog' | 'planned' | 'in_progress' | 'completed';
  sparc_project_id?: string;
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  features: string[]; // References to feature IDs
  business_value: string;
  timeline: {
    start_date: string;
    end_date: string;
  };
  status: 'draft' | 'approved' | 'in_progress' | 'completed';
  sparc_project_id?: string;
}

// Roadmap Types
export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  type: 'epic' | 'feature' | 'initiative';
  quarter: string; // e.g., "2024-Q1"
  effort_estimate: number; // story points or hours
  business_value: 'high' | 'medium' | 'low';
  dependencies: string[];
  status: 'planned' | 'in_progress' | 'completed' | 'blocked';
  sparc_project_id?: string;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  timeframe: {
    start_quarter: string;
    end_quarter: string;
  };
  items: RoadmapItem[];
  last_updated: string;
}

/**
 * Project Management Integration Service
 */
export class ProjectManagementIntegration {
  private readonly projectRoot: string;
  private readonly tasksFile: string;
  private readonly adrDir: string;
  private readonly prdDir: string;
  private readonly featuresFile: string;
  private readonly epicsFile: string;
  private readonly roadmapFile: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.tasksFile = path.join(projectRoot, 'tasks.json');
    this.adrDir = path.join(projectRoot, 'docs', 'adrs');
    this.prdDir = path.join(projectRoot, 'docs', 'prds');
    this.featuresFile = path.join(projectRoot, 'docs', 'features.json');
    this.epicsFile = path.join(projectRoot, 'docs', 'epics.json');
    this.roadmapFile = path.join(projectRoot, 'docs', 'roadmap.json');
  }

  /**
   * Generate tasks from SPARC project
   */
  async generateTasksFromSPARC(project: SPARCProject): Promise<Task[]> {
    const tasks: Task[] = [];
    let taskCounter = 1;

    // Generate tasks for each phase
    const phases = ['specification', 'pseudocode', 'architecture', 'refinement', 'completion'];
    
    for (const phase of phases) {
      const taskId = `SPARC-${project.id.toUpperCase()}-${taskCounter.toString().padStart(3, '0')}`;
      
      const task: Task = {
        id: taskId,
        title: `${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase - ${project.name}`,
        component: `sparc-${phase}`,
        description: this.getPhaseDescription(phase),
        status: project.currentPhase === phase ? 'in_progress' : 
                phases.indexOf(phase) < phases.indexOf(project.currentPhase) ? 'completed' : 'todo',
        priority: 3,
        estimated_hours: this.getPhaseEstimatedHours(phase),
        actual_hours: null,
        dependencies: taskCounter > 1 ? [`SPARC-${project.id.toUpperCase()}-${(taskCounter - 1).toString().padStart(3, '0')}`] : [],
        acceptance_criteria: this.getPhaseAcceptanceCriteria(phase, project),
        notes: `Generated from SPARC project: ${project.name}`,
        assigned_to: 'sparc-engine',
        created_date: new Date().toISOString(),
        completed_date: null,
        sparc_project_id: project.id
      };

      tasks.push(task);
      taskCounter++;
    }

    return tasks;
  }

  /**
   * Generate ADR from SPARC architecture decisions
   */
  async generateADRFromSPARC(project: SPARCProject): Promise<ADR[]> {
    const adrs: ADR[] = [];

    if (project.architecture) {
      // Generate ADR for overall architecture
      const architectureADR: ADR = {
        id: `ADR-${project.id}-001`,
        title: `Architecture Decision for ${project.name}`,
        status: 'accepted',
        context: `Architecture decisions for SPARC project: ${project.name}\n\nDomain: ${project.domain}\nComplexity: moderate`,
        decision: this.formatArchitectureDecision(project),
        consequences: this.extractArchitectureConsequences(project),
        date: new Date().toISOString(),
        sparc_project_id: project.id,
        phase: 'architecture'
      };

      adrs.push(architectureADR);

      // Generate ADRs for significant components
      if (project.architecture?.systemArchitecture?.components) {
        project.architecture.systemArchitecture.components.forEach((component, index) => {
          if (component.qualityAttributes && component.qualityAttributes.importance === 'high') {
            const componentADR: ADR = {
              id: `ADR-${project.id}-${(index + 2).toString().padStart(3, '0')}`,
              title: `${component.name} Component Design`,
              status: 'accepted',
              context: `Design decisions for ${component.name} component in ${project.name}`,
              decision: `Implement ${component.name} with:\n- Type: ${component.type}\n- Responsibilities: ${component.responsibilities.join(', ')}\n- Interfaces: ${component.interfaces.join(', ')}`,
              consequences: [`Enables ${component.responsibilities.join(' and ')}`, 'Requires integration with other components'],
              date: new Date().toISOString(),
              sparc_project_id: project.id,
              phase: 'architecture'
            };
            adrs.push(componentADR);
          }
        });
      }
    }

    return adrs;
  }

  /**
   * Generate PRD from SPARC specification
   */
  async generatePRDFromSPARC(project: SPARCProject): Promise<PRD> {
    const prd: PRD = {
      id: `PRD-${project.id}`,
      title: `Product Requirements - ${project.name}`,
      version: '1.0.0',
      overview: project.specification.successMetrics?.[0]?.description || `Product requirements for ${project.name} in the ${project.domain} domain.`,
      objectives: project.specification.functionalRequirements.map(req => req.description),
      success_metrics: project.specification.acceptanceCriteria.map(criteria => criteria.criteria.join(', ')),
      user_stories: this.generateUserStoriesFromRequirements(project.specification),
      functional_requirements: project.specification.functionalRequirements.map(req => req.description),
      non_functional_requirements: project.specification.nonFunctionalRequirements.map(req => req.description),
      constraints: project.specification.constraints.map(constraint => constraint.description),
      dependencies: project.specification.dependencies.map(dep => dep.name),
      timeline: `Estimated ${this.calculateProjectTimeline(project)} weeks`,
      stakeholders: ['Product Manager', 'Engineering Team', 'QA Team'],
      sparc_project_id: project.id
    };

    return prd;
  }

  /**
   * Update existing tasks with SPARC project information
   */
  async updateTasksWithSPARC(project: SPARCProject): Promise<void> {
    try {
      const tasksData = await fs.readFile(this.tasksFile, 'utf-8');
      const tasks: Task[] = JSON.parse(tasksData);

      // Add SPARC-generated tasks
      const sparcTasks = await this.generateTasksFromSPARC(project);
      tasks.push(...sparcTasks);

      // Write back to file
      await fs.writeFile(this.tasksFile, JSON.stringify(tasks, null, 2));
    } catch (error) {
      console.warn('Could not update tasks file:', error);
    }
  }

  /**
   * Create ADR files from SPARC project
   */
  async createADRFiles(project: SPARCProject): Promise<void> {
    try {
      await fs.mkdir(this.adrDir, { recursive: true });
      
      const adrs = await this.generateADRFromSPARC(project);
      
      for (const adr of adrs) {
        const adrContent = this.formatADRContent(adr);
        const adrFile = path.join(this.adrDir, `${adr.id.toLowerCase()}.md`);
        await fs.writeFile(adrFile, adrContent);
      }
    } catch (error) {
      console.warn('Could not create ADR files:', error);
    }
  }

  /**
   * Create PRD file from SPARC project
   */
  async createPRDFile(project: SPARCProject): Promise<void> {
    try {
      await fs.mkdir(this.prdDir, { recursive: true });
      
      const prd = await this.generatePRDFromSPARC(project);
      const prdContent = this.formatPRDContent(prd);
      const prdFile = path.join(this.prdDir, `${prd.id.toLowerCase()}.md`);
      
      await fs.writeFile(prdFile, prdContent);
    } catch (error) {
      console.warn('Could not create PRD file:', error);
    }
  }

  // Helper methods
  private getPhaseDescription(phase: string): string {
    const descriptions = {
      specification: 'Gather and analyze detailed requirements, constraints, and acceptance criteria',
      pseudocode: 'Design algorithms and data structures with complexity analysis',
      architecture: 'Design system architecture and component relationships',
      refinement: 'Optimize and refine based on performance feedback',
      completion: 'Generate production-ready implementation and documentation'
    };
    return descriptions[phase] || 'SPARC methodology phase execution';
  }

  private getPhaseEstimatedHours(phase: string): number {
    const estimates = {
      specification: 4,
      pseudocode: 6,
      architecture: 8,
      refinement: 4,
      completion: 12
    };
    return estimates[phase] || 4;
  }

  private getPhaseAcceptanceCriteria(phase: string, project: SPARCProject): string[] {
    const baseCriteria = {
      specification: [
        'All functional requirements identified and documented',
        'Non-functional requirements defined with measurable criteria',
        'Constraints and dependencies identified',
        'Acceptance criteria defined for each requirement'
      ],
      pseudocode: [
        'Core algorithms designed with pseudocode',
        'Time and space complexity analyzed',
        'Data structures specified',
        'Algorithm correctness validated'
      ],
      architecture: [
        'System architecture designed and documented',
        'Component relationships defined',
        'Interface specifications completed',
        'Deployment architecture planned'
      ],
      refinement: [
        'Performance optimization strategies identified',
        'Security considerations addressed',
        'Scalability improvements documented',
        'Quality metrics achieved'
      ],
      completion: [
        'Production-ready code generated',
        'Comprehensive test suite created',
        'Documentation completed',
        'Deployment artifacts ready'
      ]
    };

    return baseCriteria[phase] || ['Phase objectives completed'];
  }

  private formatArchitectureDecision(project: SPARCProject): string {
    if (!project.architecture) return 'Architecture not yet defined';
    
    return `Architecture Decision for ${project.name}:

## Components
${project.architecture?.systemArchitecture?.components?.map(comp => `- ${comp.name}: ${comp.type}`).join('\n') || 'Components not defined'}

## Patterns
${project.architecture?.systemArchitecture?.architecturalPatterns?.map(p => p.name).join('\n- ') || 'Patterns not defined'}

## Technology Stack
${project.architecture?.systemArchitecture?.technologyStack?.map(t => t.technology).join('\n- ') || 'Technology stack not defined'}`;
  }

  private extractArchitectureConsequences(project: SPARCProject): string[] {
    const consequences = [
      'Establishes clear component boundaries and responsibilities',
      'Enables modular development and testing',
      'Provides foundation for scalable implementation'
    ];

    if (project.architecture?.systemArchitecture?.architecturalPatterns) {
      consequences.push(`Leverages proven architectural patterns: ${project.architecture.systemArchitecture.architecturalPatterns.map(p => p.name).join(', ')}`);
    }

    return consequences;
  }

  private generateUserStoriesFromRequirements(spec: DetailedSpecification): UserStory[] {
    return spec.functionalRequirements.map((req, index) => ({
      id: `US-${index + 1}`,
      title: req.description,
      description: `As a system user, I want ${req.description.toLowerCase()} so that I can achieve the system objectives.`,
      acceptance_criteria: [`System implements ${req.description}`, 'Implementation meets performance requirements'],
      priority: req.priority?.toLowerCase() as 'high' | 'medium' | 'low' || 'medium',
      effort_estimate: 5
    }));
  }

  private calculateProjectTimeline(project: SPARCProject): number {
    const complexityWeeks = {
      simple: 2,
      moderate: 4,
      high: 8,
      complex: 12,
      enterprise: 16
    };

    return complexityWeeks['moderate'] || 4;
  }

  private formatADRContent(adr: ADR): string {
    return `# ${adr.title}

## Status
${adr.status}

## Context
${adr.context}

## Decision
${adr.decision}

## Consequences
${adr.consequences.map(c => `- ${c}`).join('\n')}

---
*Generated from SPARC project: ${adr.sparc_project_id}*
*Date: ${adr.date}*
*Phase: ${adr.phase}*
`;
  }

  private formatPRDContent(prd: PRD): string {
    return `# ${prd.title}

**Version:** ${prd.version}
**Generated from SPARC Project:** ${prd.sparc_project_id}

## Overview
${prd.overview}

## Objectives
${prd.objectives.map(obj => `- ${obj}`).join('\n')}

## Success Metrics
${prd.success_metrics.map(metric => `- ${metric}`).join('\n')}

## User Stories
${prd.user_stories.map(story => `### ${story.title}\n${story.description}\n\n**Acceptance Criteria:**\n${story.acceptance_criteria.map(ac => `- ${ac}`).join('\n')}`).join('\n\n')}

## Functional Requirements
${prd.functional_requirements.map(req => `- ${req}`).join('\n')}

## Non-Functional Requirements
${prd.non_functional_requirements.map(req => `- ${req}`).join('\n')}

## Constraints
${prd.constraints.map(constraint => `- ${constraint}`).join('\n')}

## Dependencies
${prd.dependencies.map(dep => `- ${dep}`).join('\n')}

## Timeline
${prd.timeline}

## Stakeholders
${prd.stakeholders.map(stakeholder => `- ${stakeholder}`).join('\n')}
`;
  }
}