/**
 * Naming convention validator
 * Validates adherence to naming standards and provides reports
 */

import * as path from 'path';
import { NamingAnalyzer } from './naming-analyzer.js';
import { ImportPathUpdater } from './import-updater.js';
import {
  NamingStandardizerConfig,
  NamingAnalysisResult,
  ValidationReport,
  NamingComplianceReport
} from './types.js';

export class NamingValidator {
  private readonly analyzer: NamingAnalyzer;
  private readonly importUpdater: ImportPathUpdater;
  private readonly config: NamingStandardizerConfig;

  constructor(config: NamingStandardizerConfig) {
    this.config = config;
    this.analyzer = new NamingAnalyzer(config);
    this.importUpdater = new ImportPathUpdater(config);
  }

  /**
   * Validate naming conventions for a directory
   */
  async validateNamingConventions(directory: string): Promise<NamingConventionValidationResult> {
    const analysis = await this.analyzer.analyzeDirectory(directory);
    const importValidation = await this.importUpdater.validateImportIntegrity();

    const summary = this.generateValidationSummary(analysis, importValidation);
    const recommendations = this.generateRecommendations(analysis);

    return {
      analysis,
      importValidation,
      summary,
      recommendations,
      compliance: analysis.compliance
    };
  }

  /**
   * Generate validation summary
   */
  private generateValidationSummary(
    analysis: NamingAnalysisResult,
    importValidation: ValidationReport
  ): ValidationSummary {
    const totalIssues = analysis.issues.length;
    const criticalIssues = analysis.issues.filter(i => i.severity === 'error').length;
    const warningIssues = analysis.issues.filter(i => i.severity === 'warning').length;

    return {
      filesAnalyzed: analysis.totalFiles,
      directoriesAnalyzed: analysis.totalDirectories,
      totalNamingIssues: totalIssues,
      criticalIssues,
      warningIssues,
      overallCompliance: analysis.compliance.overall,
      categories: {
        fileNaming: {
          issues: analysis.issues.filter(i => i.type === 'file-naming').length,
          compliance: analysis.compliance.fileNaming
        },
        directoryNaming: {
          issues: analysis.issues.filter(i => i.type === 'directory-naming').length,
          compliance: analysis.compliance.directoryNaming
        },
        identifierNaming: {
          issues: analysis.issues.filter(i => i.type === 'identifier-naming').length,
          compliance: analysis.compliance.identifierNaming
        },
        importPaths: {
          issues: importValidation.brokenImports.length,
          compliance: (importValidation.validImports / importValidation.totalImports) * 100
        }
      },
      importIntegrity: {
        totalImports: importValidation.totalImports,
        brokenImports: importValidation.brokenImports.length,
        circularDependencies: importValidation.circularDependencies.length
      }
    };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(analysis: NamingAnalysisResult): ValidationRecommendation[] {
    const recommendations: ValidationRecommendation[] = [];

    // File naming recommendations
    const fileNamingIssues = analysis.issues.filter(i => i.type === 'file-naming');
    if (fileNamingIssues.length > 0) {
      recommendations.push({
        category: 'file-naming',
        priority: 'high',
        title: 'Convert files to kebab-case naming',
        description: `Found ${fileNamingIssues.length} files not following kebab-case convention`,
        examples: fileNamingIssues.slice(0, 5).map(i => ({
          current: i.current,
          suggested: i.suggested,
          file: i.file
        })),
        automated: true,
        effort: this.estimateEffort(fileNamingIssues.length)
      });
    }

    // Directory naming recommendations
    const dirNamingIssues = analysis.issues.filter(i => i.type === 'directory-naming');
    if (dirNamingIssues.length > 0) {
      recommendations.push({
        category: 'directory-naming',
        priority: 'high',
        title: 'Convert directories to kebab-case naming',
        description: `Found ${dirNamingIssues.length} directories not following kebab-case convention`,
        examples: dirNamingIssues.slice(0, 5).map(i => ({
          current: i.current,
          suggested: i.suggested,
          file: i.file
        })),
        automated: true,
        effort: this.estimateEffort(dirNamingIssues.length)
      });
    }

    // TypeScript identifier recommendations
    const identifierIssues = analysis.issues.filter(i => i.type === 'identifier-naming');
    if (identifierIssues.length > 0) {
      const byType = this.groupBy(identifierIssues, i => i.identifierType || 'unknown');
      
      for (const [type, issues] of byType) {
        recommendations.push({
          category: 'identifier-naming',
          priority: issues.some(i => i.severity === 'error') ? 'high' : 'medium',
          title: `Fix ${type} naming conventions`,
          description: `Found ${issues.length} ${type}s not following naming convention`,
          examples: issues.slice(0, 3).map(i => ({
            current: i.current,
            suggested: i.suggested,
            file: i.file
          })),
          automated: false,
          effort: this.estimateEffort(issues.length)
        });
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Calculate compliance score
   */
  calculateComplianceScore(analysis: NamingAnalysisResult): number {
    return analysis.compliance.overall;
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(analysis: NamingAnalysisResult): DetailedComplianceReport {
    const report: DetailedComplianceReport = {
      overall: {
        score: analysis.compliance.overall,
        grade: this.getComplianceGrade(analysis.compliance.overall),
        description: this.getComplianceDescription(analysis.compliance.overall)
      },
      categories: {
        fileNaming: {
          score: analysis.compliance.fileNaming,
          grade: this.getComplianceGrade(analysis.compliance.fileNaming),
          issues: analysis.issues.filter(i => i.type === 'file-naming').length,
          examples: analysis.issues
            .filter(i => i.type === 'file-naming')
            .slice(0, 3)
            .map(i => `${i.current} → ${i.suggested}`)
        },
        directoryNaming: {
          score: analysis.compliance.directoryNaming,
          grade: this.getComplianceGrade(analysis.compliance.directoryNaming),
          issues: analysis.issues.filter(i => i.type === 'directory-naming').length,
          examples: analysis.issues
            .filter(i => i.type === 'directory-naming')
            .slice(0, 3)
            .map(i => `${i.current} → ${i.suggested}`)
        },
        identifierNaming: {
          score: analysis.compliance.identifierNaming,
          grade: this.getComplianceGrade(analysis.compliance.identifierNaming),
          issues: analysis.issues.filter(i => i.type === 'identifier-naming').length,
          examples: analysis.issues
            .filter(i => i.type === 'identifier-naming')
            .slice(0, 3)
            .map(i => `${i.current} → ${i.suggested}`)
        }
      },
      recommendations: this.generateRecommendations(analysis)
    };

    return report;
  }

  /**
   * Validate specific naming pattern
   */
  validateNamingPattern(name: string, expectedPattern: 'kebab-case' | 'camelCase' | 'PascalCase' | 'SCREAMING_SNAKE_CASE'): boolean {
    switch (expectedPattern) {
      case 'kebab-case':
        return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name);
      case 'camelCase':
        return /^[a-z][a-zA-Z0-9]*$/.test(name);
      case 'PascalCase':
        return /^[A-Z][a-zA-Z0-9]*$/.test(name);
      case 'SCREAMING_SNAKE_CASE':
        return /^[A-Z0-9]+(_[A-Z0-9]+)*$/.test(name);
      default:
        return false;
    }
  }

  // Helper methods
  private groupBy<T, K>(array: T[], keyFn: (item: T) => K): Map<K, T[]> {
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

  private estimateEffort(issueCount: number): 'low' | 'medium' | 'high' {
    if (issueCount <= 5) return 'low';
    if (issueCount <= 20) return 'medium';
    return 'high';
  }

  private getComplianceGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 95) return 'A';
    if (score >= 85) return 'B';
    if (score >= 75) return 'C';
    if (score >= 65) return 'D';
    return 'F';
  }

  private getComplianceDescription(score: number): string {
    if (score >= 95) return 'Excellent naming convention compliance';
    if (score >= 85) return 'Good naming convention compliance';
    if (score >= 75) return 'Fair naming convention compliance';
    if (score >= 65) return 'Poor naming convention compliance';
    return 'Critical naming convention issues';
  }
}

// Additional types for validation results
export interface NamingConventionValidationResult {
  readonly analysis: NamingAnalysisResult;
  readonly importValidation: ValidationReport;
  readonly summary: ValidationSummary;
  readonly recommendations: ValidationRecommendation[];
  readonly compliance: NamingComplianceReport;
}

export interface ValidationSummary {
  readonly filesAnalyzed: number;
  readonly directoriesAnalyzed: number;
  readonly totalNamingIssues: number;
  readonly criticalIssues: number;
  readonly warningIssues: number;
  readonly overallCompliance: number;
  readonly categories: {
    readonly fileNaming: { issues: number; compliance: number };
    readonly directoryNaming: { issues: number; compliance: number };
    readonly identifierNaming: { issues: number; compliance: number };
    readonly importPaths: { issues: number; compliance: number };
  };
  readonly importIntegrity: {
    readonly totalImports: number;
    readonly brokenImports: number;
    readonly circularDependencies: number;
  };
}

export interface ValidationRecommendation {
  readonly category: string;
  readonly priority: 'high' | 'medium' | 'low';
  readonly title: string;
  readonly description: string;
  readonly examples: Array<{ current: string; suggested: string; file: string }>;
  readonly automated: boolean;
  readonly effort: 'low' | 'medium' | 'high';
}

export interface DetailedComplianceReport {
  readonly overall: {
    readonly score: number;
    readonly grade: 'A' | 'B' | 'C' | 'D' | 'F';
    readonly description: string;
  };
  readonly categories: {
    readonly fileNaming: CategoryCompliance;
    readonly directoryNaming: CategoryCompliance;
    readonly identifierNaming: CategoryCompliance;
  };
  readonly recommendations: ValidationRecommendation[];
}

export interface CategoryCompliance {
  readonly score: number;
  readonly grade: 'A' | 'B' | 'C' | 'D' | 'F';
  readonly issues: number;
  readonly examples: string[];
}