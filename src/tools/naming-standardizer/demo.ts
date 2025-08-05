#!/usr/bin/env tsx

/**
 * Demo script for naming standardizer tools
 * Demonstrates the functionality without complex testing setup
 */

import { NamingStandardizer } from './naming-standardizer.js';

async function demoNamingStandardizer() {
  console.log('🏷️  Naming Standardizer Demo\n');

  const standardizer = new NamingStandardizer({
    rootDirectory: process.cwd(),
    includePatterns: ['src/**/*.ts'],
    excludePatterns: ['**/node_modules/**', '**/dist/**']
  });

  try {
    console.log('📊 Analyzing current project naming conventions...\n');
    
    // Quick validation
    const quickResult = await standardizer.quickValidation('./src');
    console.log(`⚡ Quick Validation: ${quickResult.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Compliance: ${quickResult.compliance}%`);
    console.log(`   Critical Issues: ${quickResult.criticalIssues}`);
    console.log(`   Warnings: ${quickResult.warningIssues}`);
    console.log(`   Summary: ${quickResult.summary}\n`);

    // Analyze specific issues
    console.log('🔍 Analyzing naming inconsistencies...');
    const issues = await standardizer.analyzeNamingInconsistencies('./src');
    
    if (issues.length === 0) {
      console.log('✅ No naming convention issues found!\n');
    } else {
      console.log(`Found ${issues.length} naming issues:\n`);
      
      // Group issues by type
      const byType = issues.reduce((groups, issue) => {
        const type = issue.type;
        if (!groups[type]) groups[type] = [];
        groups[type].push(issue);
        return groups;
      }, {} as Record<string, typeof issues>);

      for (const [type, typeIssues] of Object.entries(byType)) {
        console.log(`${getTypeIcon(type)} ${type.toUpperCase()}:`);
        for (const issue of typeIssues.slice(0, 3)) {
          console.log(`  📄 ${issue.file}`);
          console.log(`     Current:   ${issue.current}`);
          console.log(`     Suggested: ${issue.suggested}`);
        }
        if (typeIssues.length > 3) {
          console.log(`     ... and ${typeIssues.length - 3} more\n`);
        } else {
          console.log('');
        }
      }
    }

    // Generate documentation
    console.log('📚 Generating naming standards documentation...\n');
    const docs = standardizer.generateNamingStandardsDoc();
    console.log('Documentation generated! (First 500 characters):');
    console.log(docs.substring(0, 500) + '...\n');

    // Validate naming conventions
    console.log('📈 Comprehensive naming validation...');
    const validation = await standardizer.validateNamingConventions('./src');
    
    console.log(`Files Analyzed: ${validation.filesAnalyzed}`);
    console.log(`Directories Analyzed: ${validation.directoriesAnalyzed}`);
    console.log(`Total Issues: ${validation.issuesFound}`);
    console.log(`Overall Compliance: ${validation.compliance}%`);
    
    console.log('\nCategory Breakdown:');
    console.log(`  File Naming: ${validation.categories.fileNaming} issues`);
    console.log(`  Directory Naming: ${validation.categories.directoryNaming} issues`);
    console.log(`  Identifier Naming: ${validation.categories.identifierNaming} issues`);
    console.log(`  Import Paths: ${validation.categories.importPaths} issues`);

    if (validation.recommendations.length > 0) {
      console.log('\n💡 Top Recommendations:');
      for (const rec of validation.recommendations.slice(0, 3)) {
        console.log(`  ${getPriorityIcon(rec.priority)} ${rec.title}`);
        console.log(`     ${rec.description}`);
        console.log(`     Effort: ${rec.effort}, Automated: ${rec.automated ? 'Yes' : 'No'}`);
      }
    }

  } catch (error) {
    console.error('❌ Error running demo:', error);
  }
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    'file-naming': '📄',
    'directory-naming': '📁',
    'identifier-naming': '🏷️',
    'import-path': '🔗'
  };
  return icons[type] || '📝';
}

function getPriorityIcon(priority: string): string {
  const icons: Record<string, string> = {
    'high': '🔴',
    'medium': '🟡',
    'low': '🟢'
  };
  return icons[priority] || '⚪';
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  demoNamingStandardizer().catch(console.error);
}