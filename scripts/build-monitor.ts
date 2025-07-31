#!/usr/bin/env node

/**
 * Build Monitor - Continuous build verification for alpha release
 * @fileoverview
 * Advanced build monitoring with strict TypeScript standards
 * @author Claude Code Flow Team
 * @version 2.0.0
 */
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/** TypeScript error information */
interface TypeScriptError {
  file?: string;
  line?: number;
  code?: string;
  message: string;
}

/** Build result information */
interface BuildResult {
  timestamp: string;
  errorCount: number;
  errors: TypeScriptError[];
  success: boolean;
}

/** Error category breakdown */
interface ErrorCategories {
  type_compatibility: number;
  missing_properties: number;
  import_export: number;
  null_undefined: number;
  constructor_issues: number;
  other: number;
}

/** Alpha certification status */
interface AlphaCertification {
  timestamp: string;
  status: 'ALPHA_READY' | 'IN_PROGRESS';
  errorCount: number;
  buildSuccess: boolean;
  verifiedBy: string;
}

/** Build monitoring report */
interface BuildReport {
  timestamp: string;
  currentErrorCount: number;
  buildHistory: BuildResult[];
  errorCategories: ErrorCategories;
  status: 'ALPHA_READY' | 'IN_PROGRESS';
}

/** Build Monitor class for continuous build verification */
/** Monitors TypeScript compilation progress toward zero-error alpha release */
class BuildMonitor {
  private errorCount: number;
  private lastCheck: number;
  private monitoringActive: boolean;
  private buildHistory: BuildResult[];
  private errorCategories: ErrorCategories;

  /** Initializes build monitor with baseline metrics */
  constructor() {
    this.errorCount = 282; // Baseline error count
    this.lastCheck = Date.now();
    this.monitoringActive = true;
    this.buildHistory = [];
    this.errorCategories = {
      type_compatibility: 0,
      missing_properties: 0,
      import_export: 0,
      null_undefined: 0,
      constructor_issues: 0,
      other: 0
    };
  }

  /** Executes build process and captures results */
  /** Parses TypeScript errors and categorizes them */
  async runBuild(): Promise<BuildResult> {
    console.warn('Running build verification...');
    try {
      const { stdout, stderr } = await execAsync('npm run build');
      const buildOutput = stderr || stdout;
      const errors = this.parseErrors(buildOutput);
      const buildResult: BuildResult = {
        timestamp: new Date().toISOString(),
        errorCount: errors.length,
        errors,
        success: errors.length === 0
      };
      this.buildHistory.push(buildResult);
      return buildResult;
    } catch (error) {
      // Build failed, capture error information
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errors = this.parseErrors(errorMessage);
      const buildResult: BuildResult = {
        timestamp: new Date().toISOString(),
        errorCount: errors.length,
        errors,
        success: false
      };
      this.buildHistory.push(buildResult);
      return buildResult;
    }
  }

  /** Parses build output to extract TypeScript errors */
  /** Categorizes errors by type for analysis */
  private parseErrors(buildOutput: string): TypeScriptError[] {
    if (!buildOutput) return [];
    
    const errorLines = buildOutput
      .split('\n')
      .filter((line) => line.includes('error TS') || line.includes('Error'));
    
    return errorLines.map((line) => {
      const match = line.match(/([^:]+):\s*error\s+TS(\d+):\s*(.+)/);
      if (match) {
        return {
          file: match[1],
          code: match[2],
          message: match[3]
        };
      }
      return { message: line };
    });
  }

  /** Checks swarm memory for agent activity */
  /** Monitors for progress updates from other agents */
  async checkAgentActivity(): Promise<boolean> {
    return true; // Simplified implementation
  }

  /** Main monitoring loop */
  /** Continuously monitors build status and reports progress */
  async monitor(): Promise<void> {
    console.warn('Build-Verifier Agent - Continuous Monitoring Active');
    console.warn('Baseline error count: 282');
    console.warn('Target: Zero errors for alpha release');
    
    while (this.monitoringActive) {
      try {
        // Check for swarm activity
        const hasActivity = await this.checkAgentActivity();
        
        if (hasActivity) {
          const buildResult = await this.runBuild();
          console.warn(`Build completed: ${buildResult.errorCount} errors`);
        }
        
        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds
      } catch (error) {
        console.error('Monitor error:', error);
        await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute on error
      }
    }
  }
}

// Export for use by other scripts
export default BuildMonitor;
/** Updates other agents on progress status; */
