/**
 * SPARC Template CLI Commands
 *
 * CLI interface for SPARC template engine integration and specification generation
 */

import { Command } from 'commander';
import { writeFile, readFile } from 'fs/promises';
import { TemplateEngine } from '../../coordination/swarm/sparc/core/template-engine';
import { SpecificationPhaseEngine } from '../../coordination/swarm/sparc/phases/specification/specification-engine';
import type { ProjectSpecification } from '../../coordination/swarm/sparc/types/sparc-types';

export function createSPARCTemplateCommands(): Command {
  const sparcTemplateCmd = new Command('spec');
  sparcTemplateCmd.description('SPARC specification generation with database-driven template engine');

  // Add database configuration options
  sparcTemplateCmd
    .option('--backend <type>', 'Database backend type (sqlite|json|lancedb)', 'sqlite')
    .option('--db-path <path>', 'Database file path', './data/sparc-templates.db')
    .option('--namespace <ns>', 'Database namespace', 'sparc-templates');

  // Helper function to create template engine with CLI options
  const createTemplateEngine = (options: any) => {
    return new TemplateEngine({
      backend: {
        type: options.backend || 'sqlite',
        path: options.dbPath || './data/sparc-templates.db',
        enabled: true,
      },
      namespace: options.namespace || 'sparc-templates',
    });
  };

  const createSpecEngine = (options: any) => {
    return new SpecificationPhaseEngine();
  };

  // List available templates
  sparcTemplateCmd
    .command('templates')
    .description('List available SPARC templates from database')
    .action(async (options, command) => {
      const parentOptions = command.parent?.opts() || {};
      const specEngine = createSpecEngine(parentOptions);
      
      console.log('📋 Available SPARC Templates (Database-backed):\n');
      
      const templates = specEngine.getAvailableTemplates();
      templates.forEach((template, index) => {
        console.log(`${index + 1}. ${template.name}`);
        console.log(`   Domain: ${template.domain}`);
        console.log(`   Complexity: ${template.complexity}`);
        console.log(`   Description: ${template.description}`);
        console.log('');
      });
      
      console.log(`Total templates: ${templates.length}`);
      console.log(`Backend: ${parentOptions.backend || 'sqlite'}`);
      console.log(`Database: ${parentOptions.dbPath || './data/sparc-templates.db'}`);
    });

  // Generate specification from template
  sparcTemplateCmd
    .command('generate')
    .description('Generate specification from project requirements using templates')
    .requiredOption('--name <name>', 'Project name')
    .requiredOption('--domain <domain>', 'Project domain (memory-systems|neural-networks|rest-api|swarm-coordination)')
    .option('--template <templateId>', 'Specific template ID to use')
    .option('--complexity <level>', 'Project complexity (simple|moderate|high|complex|enterprise)', 'moderate')
    .option('--requirements <requirements...>', 'List of project requirements')
    .option('--constraints <constraints...>', 'List of project constraints')
    .option('--output <path>', 'Output file path', 'specification.json')
    .option('--format <format>', 'Output format (json|markdown)', 'json')
    .action(async (options, command) => {
      try {
        const parentOptions = command.parent?.opts() || {};
        const specEngine = createSpecEngine(parentOptions);
        
        console.log(`🔧 Generating SPARC specification for: ${options.name} [Database-backed]`);
        
        // Create project specification
        const projectSpec: ProjectSpecification = {
          name: options.name,
          domain: options.domain,
          complexity: options.complexity,
          requirements: options.requirements || [],
          constraints: options.constraints || [],
        };

        console.log(`📋 Project domain: ${projectSpec.domain}`);
        console.log(`🎯 Complexity: ${projectSpec.complexity}`);
        console.log(`📝 Requirements: ${projectSpec.requirements.length}`);
        console.log(`💾 Backend: ${parentOptions.backend || 'sqlite'} @ ${parentOptions.dbPath || './data/sparc-templates.db'}`);
        
        let specification;
        if (options.template) {
          // Validate template compatibility first
          const compatibility = specEngine.validateTemplateCompatibility(projectSpec, options.template);
          console.log(`🔍 Template compatibility: ${(compatibility.score * 100).toFixed(1)}%`);
          
          if (compatibility.warnings.length > 0) {
            console.log('⚠️ Warnings:');
            compatibility.warnings.forEach(warning => {
              console.log(`   • ${warning}`);
            });
          }
          
          if (!compatibility.compatible) {
            console.error('❌ Template is not compatible with project specification');
            return;
          }

          // Generate with specific template
          specification = await specEngine.generateSpecificationFromTemplate(projectSpec, options.template);
        } else {
          // Auto-select best template
          specification = await specEngine.generateSpecificationFromTemplate(projectSpec);
        }

        // Format output
        let output: string;
        if (options.format === 'markdown') {
          output = formatSpecificationAsMarkdown(specification);
        } else {
          output = JSON.stringify(specification, null, 2);
        }

        // Write output
        await writeFile(options.output, output, 'utf8');
        
        console.log('✅ Specification generated successfully!');
        console.log(`📄 Output saved to: ${options.output}`);
        console.log(`📊 Functional Requirements: ${specification.functionalRequirements.length}`);
        console.log(`⚡ Non-Functional Requirements: ${specification.nonFunctionalRequirements.length}`);
        console.log(`🔒 Constraints: ${specification.constraints?.length || 0}`);
        console.log(`✔️ Acceptance Criteria: ${specification.acceptanceCriteria?.length || 0}`);

      } catch (error) {
        console.error('❌ Failed to generate specification:', error);
        process.exit(1);
      }
    });

  // Interactive specification generation
  sparcTemplateCmd
    .command('interactive')
    .description('Interactive specification generation with template selection')
    .option('--output <path>', 'Output file path', 'specification.json')
    .action(async (options) => {
      try {
        console.log('🎯 Interactive SPARC Specification Generation\n');
        
        // This would use inquirer for interactive prompts in a full implementation
        console.log('📋 This would launch an interactive wizard to:');
        console.log('   1. Collect project details (name, domain, complexity)');
        console.log('   2. Gather requirements and constraints');
        console.log('   3. Show compatible templates with scores');
        console.log('   4. Allow template selection and customization');
        console.log('   5. Generate and save specification');
        console.log('');
        console.log('💡 For now, use: claude-zen sparc spec generate --name "My Project" --domain memory-systems');
        
      } catch (error) {
        console.error('❌ Interactive mode failed:', error);
        process.exit(1);
      }
    });

  // Validate existing specification
  sparcTemplateCmd
    .command('validate')
    .description('Validate existing specification file')
    .requiredOption('--file <path>', 'Path to specification file')
    .action(async (options) => {
      try {
        console.log(`🔍 Validating specification: ${options.file}`);
        
        const content = await readFile(options.file, 'utf8');
        const specification = JSON.parse(content);
        
        const validation = await specEngine.validateSpecificationCompleteness(specification);
        
        console.log(`\n📊 Validation Results:`);
        console.log(`Overall Score: ${(validation.score * 100).toFixed(1)}%`);
        console.log(`Status: ${validation.overall ? '✅ PASSED' : '❌ NEEDS IMPROVEMENT'}`);
        
        if (validation.results.length > 0) {
          console.log('\n📋 Detailed Results:');
          validation.results.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            console.log(`   ${status} ${result.criterion}: ${result.details}`);
          });
        }
        
        if (validation.recommendations.length > 0) {
          console.log('\n💡 Recommendations:');
          validation.recommendations.forEach(rec => {
            console.log(`   • ${rec}`);
          });
        }

        process.exit(validation.overall ? 0 : 1);
        
      } catch (error) {
        console.error('❌ Validation failed:', error);
        process.exit(1);
      }
    });

  // Template statistics with database information
  sparcTemplateCmd
    .command('stats')
    .description('Show template engine statistics and database status')
    .action(async (options, command) => {
      const parentOptions = command.parent?.opts() || {};
      const templateEngine = createTemplateEngine(parentOptions);
      
      console.log('📊 SPARC Template Engine Statistics (Database-backed):\n');
      
      await templateEngine.initialize();
      const stats = await templateEngine.getTemplateStats();
      const dbStatus = await templateEngine.getDatabaseStatus();
      
      console.log(`Total Templates: ${stats.totalTemplates}`);
      console.log(`Domain Coverage:`, stats.domainCoverage);
      console.log(`Most Used:`, stats.mostUsed);
      console.log(`Recently Used:`, stats.recentlyUsed);
      
      console.log('\n💾 Database Information:');
      console.log(`Backend: ${stats.databaseInfo.backend}`);
      console.log(`Namespace: ${stats.databaseInfo.namespace}`);
      console.log(`Last Sync: ${stats.databaseInfo.lastSync}`);
      console.log(`Health: ${dbStatus.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
      console.log(`Database Path: ${parentOptions.dbPath || './data/sparc-templates.db'}`);
    });

  // Database health check
  sparcTemplateCmd
    .command('db-status')
    .description('Check database health and connection status')
    .action(async (options, command) => {
      const parentOptions = command.parent?.opts() || {};
      const templateEngine = createTemplateEngine(parentOptions);
      
      console.log('🔍 SPARC Database Health Check:\n');
      
      try {
        await templateEngine.initialize();
        const dbStatus = await templateEngine.getDatabaseStatus();
        
        console.log(`Backend Type: ${dbStatus.backend}`);
        console.log(`Namespace: ${dbStatus.namespace}`);
        console.log(`Template Count: ${dbStatus.templateCount}`);
        console.log(`Health Status: ${dbStatus.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
        console.log(`Database Path: ${parentOptions.dbPath || './data/sparc-templates.db'}`);
        
        if (dbStatus.stats) {
          console.log('\n📊 Database Statistics:');
          console.log(JSON.stringify(dbStatus.stats, null, 2));
        }
        
        if (!dbStatus.healthy) {
          console.log('\n⚠️  Database issues detected. Check configuration and file permissions.');
          process.exit(1);
        }
        
      } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
      }
    });

  return sparcTemplateCmd;
}

/**
 * Format specification as Markdown
 */
function formatSpecificationAsMarkdown(specification: any): string {
  let markdown = `# SPARC Specification: ${specification.id}\n\n`;
  markdown += `**Domain:** ${specification.domain}\n\n`;
  
  // Functional Requirements
  markdown += `## Functional Requirements (${specification.functionalRequirements.length})\n\n`;
  specification.functionalRequirements.forEach((req: any, index: number) => {
    markdown += `### ${index + 1}. ${req.title}\n`;
    markdown += `**Priority:** ${req.priority}\n`;
    markdown += `**Description:** ${req.description}\n\n`;
    
    if (req.testCriteria && req.testCriteria.length > 0) {
      markdown += `**Test Criteria:**\n`;
      req.testCriteria.forEach((criteria: string) => {
        markdown += `- ${criteria}\n`;
      });
      markdown += `\n`;
    }
  });
  
  // Non-Functional Requirements
  if (specification.nonFunctionalRequirements && specification.nonFunctionalRequirements.length > 0) {
    markdown += `## Non-Functional Requirements (${specification.nonFunctionalRequirements.length})\n\n`;
    specification.nonFunctionalRequirements.forEach((req: any, index: number) => {
      markdown += `### ${index + 1}. ${req.title}\n`;
      markdown += `**Priority:** ${req.priority}\n`;
      markdown += `**Description:** ${req.description}\n\n`;
      
      if (req.metrics) {
        markdown += `**Metrics:**\n`;
        Object.entries(req.metrics).forEach(([key, value]) => {
          markdown += `- ${key}: ${value}\n`;
        });
        markdown += `\n`;
      }
    });
  }
  
  // Constraints
  if (specification.constraints && specification.constraints.length > 0) {
    markdown += `## System Constraints (${specification.constraints.length})\n\n`;
    specification.constraints.forEach((constraint: any, index: number) => {
      markdown += `${index + 1}. **${constraint.type}**: ${constraint.description}\n`;
    });
    markdown += `\n`;
  }
  
  // Risk Assessment
  if (specification.riskAssessment?.risks?.length > 0) {
    markdown += `## Risk Assessment\n\n`;
    markdown += `**Overall Risk Level:** ${specification.riskAssessment.overallRisk}\n\n`;
    
    markdown += `### Identified Risks\n`;
    specification.riskAssessment.risks.forEach((risk: any, index: number) => {
      markdown += `${index + 1}. **${risk.category}**: ${risk.description}\n`;
      markdown += `   - Probability: ${risk.probability}\n`;
      markdown += `   - Impact: ${risk.impact}\n\n`;
    });
  }
  
  // Success Metrics
  if (specification.successMetrics && specification.successMetrics.length > 0) {
    markdown += `## Success Metrics (${specification.successMetrics.length})\n\n`;
    specification.successMetrics.forEach((metric: any, index: number) => {
      markdown += `${index + 1}. **${metric.name}**: ${metric.target}\n`;
      markdown += `   - ${metric.description}\n`;
      markdown += `   - Measurement: ${metric.measurement}\n\n`;
    });
  }
  
  markdown += `---\n*Generated by SPARC Template Engine on ${new Date().toISOString()}*\n`;
  
  return markdown;
}