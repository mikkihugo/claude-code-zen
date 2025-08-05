#!/usr/bin/env node

/**
 * CLI for naming standardizer tools
 * Provides command-line interface for naming convention analysis and fixes
 */

import { NamingStandardizer } from './naming-standardizer.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const directory = args[1] || process.cwd();
  const flags = args.slice(2);

  const standardizer = new NamingStandardizer({
    rootDirectory: directory
  });

  try {
    switch (command) {
      case 'analyze':
        await analyzeCommand(standardizer, directory);
        break;
      case 'validate':
        await validateCommand(standardizer, directory);
        break;
      case 'fix':
        await fixCommand(standardizer, directory, flags.includes('--dry-run'));
        break;
      case 'quick':
        await quickCommand(standardizer, directory);
        break;
      case 'docs':
        await docsCommand(standardizer);
        break;
      default:
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

async function analyzeCommand(standardizer: NamingStandardizer, directory: string) {
  console.log(`📊 Analyzing naming conventions in: ${directory}\n`);
  
  const issues = await standardizer.analyzeNamingInconsistencies(directory);
  
  if (issues.length === 0) {
    console.log('✅ No naming convention issues found!');
    return;
  }

  console.log(`Found ${issues.length} naming issues:\n`);
  
  const grouped = groupBy(issues, i => i.type);
  
  for (const [type, typeIssues] of grouped) {
    console.log(`${getTypeIcon(type)} ${type.replace('-', ' ').toUpperCase()}:`);
    
    for (const issue of typeIssues.slice(0, 10)) {
      console.log(`  ${issue.file}`);
      console.log(`    Current:   ${issue.current}`);
      console.log(`    Suggested: ${issue.suggested}`);
      console.log();
    }
    
    if (typeIssues.length > 10) {
      console.log(`  ... and ${typeIssues.length - 10} more\n`);
    }
  }
}

async function validateCommand(standardizer: NamingStandardizer, directory: string) {
  console.log(`🔍 Validating naming conventions in: ${directory}\n`);
  
  const result = await standardizer.validateNamingConventions(directory);
  
  console.log('📈 COMPLIANCE REPORT');
  console.log('===================');
  console.log(`Overall Compliance: ${result.compliance}% ${getGradeEmoji(result.compliance)}`);
  console.log(`Files Analyzed: ${result.filesAnalyzed}`);
  console.log(`Directories Analyzed: ${result.directoriesAnalyzed}`);
  console.log(`Total Issues: ${result.issuesFound}`);
  console.log();
  
  console.log('📊 CATEGORY BREAKDOWN');
  console.log('====================');
  console.log(`File Naming: ${result.categories.fileNaming} issues`);
  console.log(`Directory Naming: ${result.categories.directoryNaming} issues`);
  console.log(`Identifier Naming: ${result.categories.identifierNaming} issues`);
  console.log(`Import Paths: ${result.categories.importPaths} issues`);
  console.log();
  
  if (result.recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS');
    console.log('==================');
    for (const rec of result.recommendations.slice(0, 5)) {
      console.log(`${getPriorityIcon(rec.priority)} ${rec.title}`);
      console.log(`   ${rec.description}`);
      console.log(`   Effort: ${rec.effort}, Automated: ${rec.automated ? 'Yes' : 'No'}`);
      console.log();
    }
  }
}

async function fixCommand(standardizer: NamingStandardizer, directory: string, dryRun: boolean) {
  console.log(`🔧 ${dryRun ? 'Simulating' : 'Executing'} naming fixes in: ${directory}\n`);
  
  const issues = await standardizer.analyzeNamingInconsistencies(directory);
  
  if (issues.length === 0) {
    console.log('✅ No naming convention issues to fix!');
    return;
  }
  
  console.log(`Found ${issues.length} issues to fix...`);
  
  const script = await standardizer.generateRenameScript(issues);
  
  console.log(`📝 Rename Script Generated:`);
  console.log(`   File operations: ${script.operations.filter(op => op.type === 'file').length}`);
  console.log(`   Directory operations: ${script.operations.filter(op => op.type === 'directory').length}`);
  console.log(`   Import updates: ${script.importUpdates.length}`);
  console.log(`   Total changes: ${script.estimatedChanges}`);
  console.log();
  
  if (dryRun) {
    console.log('🏃‍♂️ DRY RUN - No changes will be made');
    console.log('\nOperations that would be performed:');
    
    for (const op of script.operations.slice(0, 10)) {
      console.log(`  ${op.type}: ${op.from} → ${op.to}`);
    }
    
    if (script.operations.length > 10) {
      console.log(`  ... and ${script.operations.length - 10} more operations`);
    }
    return;
  }
  
  console.log('⚠️  This will modify your files. Backup will be created.');
  console.log('Proceeding with fixes...\n');
  
  const result = await standardizer.executeRenames(script, false);
  
  if (result.success) {
    console.log('✅ Naming fixes completed successfully!');
    console.log(`   Operations completed: ${result.operationsCompleted}`);
    console.log(`   Backup created: ${result.backupCreated}`);
  } else {
    console.log('❌ Naming fixes failed:');
    for (const error of result.errors) {
      console.log(`   ${error}`);
    }
  }
}

async function quickCommand(standardizer: NamingStandardizer, directory: string) {
  console.log(`⚡ Quick validation for: ${directory}`);
  
  const result = await standardizer.quickValidation(directory);
  
  console.log(`${result.passed ? '✅ PASSED' : '❌ FAILED'}: ${result.summary}`);
  
  if (!result.passed) {
    process.exit(1);
  }
}

async function docsCommand(standardizer: NamingStandardizer) {
  console.log('📚 Naming Convention Standards\n');
  console.log(standardizer.generateNamingStandardsDoc());
}

function showHelp() {
  console.log(`
🏷️  Naming Standardizer CLI

Usage: naming-standardizer <command> [directory] [options]

Commands:
  analyze [dir]    📊 Analyze naming convention violations
  validate [dir]   🔍 Validate naming conventions and generate report
  fix [dir]        🔧 Fix naming issues (use --dry-run to simulate)
  quick [dir]      ⚡ Quick validation for CI/CD
  docs            📚 Generate naming standards documentation

Options:
  --dry-run       Simulate changes without modifying files

Examples:
  naming-standardizer analyze src/
  naming-standardizer validate . 
  naming-standardizer fix src/ --dry-run
  naming-standardizer quick src/
  naming-standardizer docs > NAMING_STANDARDS.md
`);
}

// Helper functions
function groupBy<T, K>(array: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  
  for (const item of array) {
    const key = keyFn(item);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }
  
  return groups;
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

function getGradeEmoji(score: number): string {
  if (score >= 95) return '🅰️';
  if (score >= 85) return '🅱️';
  if (score >= 75) return '🆒';
  if (score >= 65) return '🆔';
  return '🆘';
}

// Run the CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}