/**
 * Main interface for the naming standardizer system
 * Implements the requirements from the GitHub issue
 */

import * as path from 'path';
import { NamingAnalyzer } from './naming-analyzer.js';
import { FileRenamer } from './file-renamer.js';
import { ImportPathUpdater } from './import-updater.js';
import { NamingValidator } from './naming-validator.js';
import {
  NamingStandardizerConfig,
  NamingIssue,
  RenameOperation,
  RenameScript,
  RenameResult,
  ValidationResult,
  NamingAnalysisResult
} from './types.js';

export class NamingStandardizer {
  private readonly config: NamingStandardizerConfig;
  private readonly analyzer: NamingAnalyzer;
  private readonly renamer: FileRenamer;
  private readonly importUpdater: ImportPathUpdater;
  private readonly validator: NamingValidator;

  constructor(config: Partial<NamingStandardizerConfig> = {}) {
    this.config = this.createDefaultConfig(config);
    this.analyzer = new NamingAnalyzer(this.config);
    this.renamer = new FileRenamer(this.config);
    this.importUpdater = new ImportPathUpdater(this.config);
    this.validator = new NamingValidator(this.config);
  }

  /**
   * Analyze naming inconsistencies in a directory
   */
  async analyzeNamingInconsistencies(directory: string): Promise<NamingIssue[]> {
    const analysis = await this.analyzer.analyzeDirectory(directory);
    return analysis.issues;
  }

  /**
   * Generate a rename script from identified issues
   */
  async generateRenameScript(issues: NamingIssue[]): Promise<RenameScript> {
    const operations: RenameOperation[] = [];
    
    // Generate file rename operations
    const fileIssues = issues.filter(i => i.type === 'file-naming');
    for (const issue of fileIssues) {
      const dirname = path.dirname(issue.file);
      const newPath = path.join(dirname, issue.suggested);
      
      operations.push({
        from: issue.file,
        to: newPath,
        type: 'file'
      });
    }

    // Generate directory rename operations
    const dirIssues = issues.filter(i => i.type === 'directory-naming');
    for (const issue of dirIssues) {
      const parentDir = path.dirname(issue.file);
      const newPath = path.join(parentDir, issue.suggested);
      
      operations.push({
        from: issue.file,
        to: newPath,
        type: 'directory'
      });
    }

    // Generate import path updates
    const imports = await this.importUpdater.scanAllImports(this.config.rootDirectory);
    const fileRenameMap = new Map(
      operations
        .filter(op => op.type === 'file')
        .map(op => [op.from, op.to])
    );
    
    const importUpdates = this.importUpdater.generatePathUpdates(imports, fileRenameMap);

    return {
      operations,
      importUpdates,
      estimatedChanges: operations.length + importUpdates.length,
      backupPath: await this.generateBackupPath()
    };
  }

  /**
   * Execute renames with safety checks
   */
  async executeRenames(script: RenameScript, dryRun: boolean = false): Promise<RenameResult> {
    if (dryRun) {
      return {
        success: true,
        operationsCompleted: 0,
        operationsFailed: 0,
        errors: [],
        backupCreated: script.backupPath
      };
    }

    // Validate the rename operations first
    const validation = await this.renamer.validateNoBreakingChanges(script.operations);
    if (!validation.valid) {
      return {
        success: false,
        operationsCompleted: 0,
        operationsFailed: script.operations.length,
        errors: validation.errors,
        backupCreated: ''
      };
    }

    // Execute the renames
    return await this.renamer.renameWithImportUpdates(script.operations);
  }

  /**
   * Comprehensive naming validation
   */
  async validateNamingConventions(directory: string): Promise<NamingValidationResult> {
    const validationResult = await this.validator.validateNamingConventions(directory);
    
    return {
      filesAnalyzed: validationResult.analysis.totalFiles,
      directoriesAnalyzed: validationResult.analysis.totalDirectories,
      issuesFound: validationResult.analysis.issues.length,
      categories: {
        fileNaming: validationResult.summary.categories.fileNaming.issues,
        directoryNaming: validationResult.summary.categories.directoryNaming.issues,
        identifierNaming: validationResult.summary.categories.identifierNaming.issues,
        importPaths: validationResult.summary.categories.importPaths.issues
      },
      compliance: this.validator.calculateComplianceScore(validationResult.analysis),
      recommendations: validationResult.recommendations,
      report: this.validator.generateComplianceReport(validationResult.analysis)
    };
  }

  /**
   * Quick analysis for CI/CD integration
   */
  async quickValidation(directory: string): Promise<QuickValidationResult> {
    const analysis = await this.analyzer.analyzeDirectory(directory);
    const compliance = this.validator.calculateComplianceScore(analysis);
    
    const criticalIssues = analysis.issues.filter(i => i.severity === 'error').length;
    const warningIssues = analysis.issues.filter(i => i.severity === 'warning').length;
    
    return {
      passed: criticalIssues === 0 && compliance >= 90,
      compliance,
      criticalIssues,
      warningIssues,
      summary: `${criticalIssues} critical issues, ${warningIssues} warnings. Compliance: ${compliance}%`
    };
  }

  /**
   * Generate naming standards documentation
   */
  generateNamingStandardsDoc(): string {
    return `# Naming Convention Standards

## File and Directory Naming

All files and directories should use **kebab-case** naming:

### ✅ Correct Examples
\`\`\`
src/
├── coordination/
├── load-balancing/
├── neural-networks/
└── swarm-intelligence/

Files:
- swarm-coordinator.ts
- load-balancing-engine.ts
- neural-network-trainer.ts
\`\`\`

### ❌ Incorrect Examples
\`\`\`
- SwarmCoordinator.ts (PascalCase)
- loadBalancingEngine.ts (camelCase)
- neural_network.ts (snake_case)
\`\`\`

## TypeScript Naming Conventions

### Interfaces: PascalCase
\`\`\`typescript
interface SwarmCoordinator {
  coordinateAgents(): Promise<void>;
}
\`\`\`

### Classes: PascalCase
\`\`\`typescript
class LoadBalancingEngine {
  private readonly strategy: BalancingStrategy;
}
\`\`\`

### Functions/Methods: camelCase
\`\`\`typescript
function coordinateSwarm(): void {}
async function balanceWorkload(): Promise<void> {}
\`\`\`

### Variables: camelCase
\`\`\`typescript
const swarmManager = new SwarmManager();
let currentStrategy = 'round-robin';
\`\`\`

### Constants: SCREAMING_SNAKE_CASE
\`\`\`typescript
const MAX_AGENTS = 1000;
const DEFAULT_TIMEOUT = 30000;
\`\`\`

### Types: PascalCase
\`\`\`typescript
type LoadBalancingStrategy = 'round-robin' | 'least-connections';
\`\`\`

### String Literals: kebab-case
\`\`\`typescript
type EventType = 'swarm-started' | 'agent-connected' | 'task-completed';
\`\`\`

## Automated Validation

Use the naming standardizer tools:

\`\`\`bash
# Analyze naming issues
npx tsx src/tools/naming-standardizer/cli.ts analyze src/

# Validate compliance
npx tsx src/tools/naming-standardizer/cli.ts validate src/

# Generate rename script (dry run)
npx tsx src/tools/naming-standardizer/cli.ts fix src/ --dry-run
\`\`\`

## CI/CD Integration

Add to your workflow:

\`\`\`yaml
- name: Validate Naming Conventions
  run: npm run naming:validate
\`\`\`
`;
  }

  // Private helper methods
  private createDefaultConfig(overrides: Partial<NamingStandardizerConfig>): NamingStandardizerConfig {
    return {
      rootDirectory: process.cwd(),
      includePatterns: ['**/*.ts', '**/*.tsx'],
      excludePatterns: ['**/node_modules/**', '**/dist/**', '**/*.d.ts'],
      fileExtensions: ['.ts', '.tsx'],
      enabledRules: {
        fileNaming: true,
        directoryNaming: true,
        interfaceNaming: true,
        classNaming: true,
        functionNaming: true,
        variableNaming: true,
        constantNaming: true,
        typeNaming: true
      },
      conventions: {
        files: 'kebab-case',
        directories: 'kebab-case',
        interfaces: 'PascalCase',
        classes: 'PascalCase',
        functions: 'camelCase',
        variables: 'camelCase',
        constants: 'SCREAMING_SNAKE_CASE',
        types: 'PascalCase'
      },
      ...overrides
    };
  }

  private async generateBackupPath(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return path.join(this.config.rootDirectory, `.backup-${timestamp}`);
  }
}

// Export interfaces for the main API
export interface NamingValidationResult {
  readonly filesAnalyzed: number;
  readonly directoriesAnalyzed: number;
  readonly issuesFound: number;
  readonly categories: {
    readonly fileNaming: number;
    readonly directoryNaming: number;
    readonly identifierNaming: number;
    readonly importPaths: number;
  };
  readonly compliance: number;
  readonly recommendations: any[];
  readonly report: any;
}

export interface QuickValidationResult {
  readonly passed: boolean;
  readonly compliance: number;
  readonly criticalIssues: number;
  readonly warningIssues: number;
  readonly summary: string;
}

// Export all the main interfaces
export {
  NamingAnalyzer,
  FileRenamer,
  ImportPathUpdater,
  NamingValidator
} from './index.js';

export * from './types.js';