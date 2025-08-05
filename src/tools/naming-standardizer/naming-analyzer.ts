/**
 * Naming analyzer for identifying naming convention violations
 * Following Google TypeScript Style Guide
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import {
  NamingIssue,
  NamingAnalysisResult,
  NamingComplianceReport,
  NamingStandardizerConfig,
  IdentifierType,
  NamingConvention
} from './types.js';

export class NamingAnalyzer {
  private readonly config: NamingStandardizerConfig;

  constructor(config: NamingStandardizerConfig) {
    this.config = config;
  }

  /**
   * Analyze a directory for naming convention violations
   */
  async analyzeDirectory(targetPath: string): Promise<NamingAnalysisResult> {
    const files = await this.scanFiles(targetPath);
    const directories = await this.scanDirectories(targetPath);
    const issues: NamingIssue[] = [];

    // Analyze file naming
    for (const file of files) {
      const fileIssues = await this.analyzeFile(file);
      issues.push(...fileIssues);
    }

    // Analyze directory naming
    for (const directory of directories) {
      const dirIssues = this.analyzeDirectoryName(directory);
      issues.push(...dirIssues);
    }

    const compliance = this.calculateCompliance(files.length, directories.length, issues);

    return {
      totalFiles: files.length,
      totalDirectories: directories.length,
      issues,
      compliance
    };
  }

  /**
   * Analyze a single file for naming violations
   */
  private async analyzeFile(filePath: string): Promise<NamingIssue[]> {
    const issues: NamingIssue[] = [];
    const basename = path.basename(filePath);
    const extension = path.extname(filePath);

    // Check file naming convention
    if (this.config.enabledRules.fileNaming) {
      const fileNameWithoutExt = basename.replace(extension, '');
      if (!this.isKebabCase(fileNameWithoutExt)) {
        issues.push({
          type: 'file-naming',
          file: filePath,
          current: basename,
          suggested: this.toKebabCase(fileNameWithoutExt) + extension,
          convention: 'kebab-case',
          severity: 'error'
        });
      }
    }

    // Analyze TypeScript identifiers if it's a TypeScript file
    if (extension === '.ts' || extension === '.tsx') {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const identifierIssues = await this.analyzeIdentifiers(content, filePath);
        issues.push(...identifierIssues);
      } catch (error) {
        // Skip files that can't be read
        console.warn(`Warning: Could not analyze file ${filePath}: ${error}`);
      }
    }

    return issues;
  }

  /**
   * Analyze directory naming
   */
  private analyzeDirectoryName(dirPath: string): NamingIssue[] {
    const issues: NamingIssue[] = [];
    
    if (!this.config.enabledRules.directoryNaming) {
      return issues;
    }

    const dirname = path.basename(dirPath);
    
    if (!this.isKebabCase(dirname)) {
      issues.push({
        type: 'directory-naming',
        file: dirPath,
        current: dirname,
        suggested: this.toKebabCase(dirname),
        convention: 'kebab-case',
        severity: 'error'
      });
    }

    return issues;
  }

  /**
   * Analyze TypeScript identifiers in file content
   */
  private async analyzeIdentifiers(content: string, filePath: string): Promise<NamingIssue[]> {
    const issues: NamingIssue[] = [];
    const lines = content.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineNumber = lineIndex + 1;

      // Analyze interfaces
      if (this.config.enabledRules.interfaceNaming) {
        const interfaceRegex = /interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        let interfaceMatch;
        while ((interfaceMatch = interfaceRegex.exec(line)) !== null) {
          const name = interfaceMatch[1];
          if (!this.isPascalCase(name)) {
            issues.push({
              type: 'identifier-naming',
              file: filePath,
              line: lineNumber,
              column: interfaceMatch.index,
              current: name,
              suggested: this.toPascalCase(name),
              convention: 'PascalCase',
              identifierType: 'interface',
              severity: 'error'
            });
          }
        }
      }

      // Analyze classes
      if (this.config.enabledRules.classNaming) {
        const classRegex = /(?:export\s+)?(?:abstract\s+)?class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        let classMatch;
        while ((classMatch = classRegex.exec(line)) !== null) {
          const name = classMatch[1];
          if (!this.isPascalCase(name)) {
            issues.push({
              type: 'identifier-naming',
              file: filePath,
              line: lineNumber,
              column: classMatch.index,
              current: name,
              suggested: this.toPascalCase(name),
              convention: 'PascalCase',
              identifierType: 'class',
              severity: 'error'
            });
          }
        }
      }

      // Analyze functions
      if (this.config.enabledRules.functionNaming) {
        const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        let functionMatch;
        while ((functionMatch = functionRegex.exec(line)) !== null) {
          const name = functionMatch[1];
          if (!this.isCamelCase(name)) {
            issues.push({
              type: 'identifier-naming',
              file: filePath,
              line: lineNumber,
              column: functionMatch.index,
              current: name,
              suggested: this.toCamelCase(name),
              convention: 'camelCase',
              identifierType: 'function',
              severity: 'error'
            });
          }
        }
      }

      // Analyze constants (SCREAMING_SNAKE_CASE)
      if (this.config.enabledRules.constantNaming) {
        const constantRegex = /(?:export\s+)?const\s+([A-Z_$][A-Z0-9_$]*)\s*=/g;
        let constantMatch;
        while ((constantMatch = constantRegex.exec(line)) !== null) {
          const name = constantMatch[1];
          if (!this.isScreamingSnakeCase(name)) {
            issues.push({
              type: 'identifier-naming',
              file: filePath,
              line: lineNumber,
              column: constantMatch.index,
              current: name,
              suggested: this.toScreamingSnakeCase(name),
              convention: 'SCREAMING_SNAKE_CASE',
              identifierType: 'constant',
              severity: 'warning'
            });
          }
        }
      }

      // Analyze types
      if (this.config.enabledRules.typeNaming) {
        const typeRegex = /(?:export\s+)?type\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        let typeMatch;
        while ((typeMatch = typeRegex.exec(line)) !== null) {
          const name = typeMatch[1];
          if (!this.isPascalCase(name)) {
            issues.push({
              type: 'identifier-naming',
              file: filePath,
              line: lineNumber,
              column: typeMatch.index,
              current: name,
              suggested: this.toPascalCase(name),
              convention: 'PascalCase',
              identifierType: 'type',
              severity: 'error'
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Scan files matching the configuration
   */
  private async scanFiles(targetPath: string): Promise<string[]> {
    const patterns = this.config.includePatterns.map(pattern => 
      path.join(targetPath, pattern)
    );
    
    const allFiles: string[] = [];
    
    for (const pattern of patterns) {
      const files = await glob(pattern, {
        ignore: this.config.excludePatterns,
        nodir: true
      });
      allFiles.push(...files);
    }

    return Array.from(new Set(allFiles)); // Remove duplicates
  }

  /**
   * Scan directories
   */
  private async scanDirectories(targetPath: string): Promise<string[]> {
    const directories: string[] = [];
    
    const scanDir = async (dirPath: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const fullPath = path.join(dirPath, entry.name);
            
            // Skip excluded directories
            const shouldExclude = this.config.excludePatterns.some(pattern =>
              fullPath.includes(pattern.replace('**/', '').replace('/*', ''))
            );
            
            if (!shouldExclude) {
              directories.push(fullPath);
              await scanDir(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not scan directory ${dirPath}: ${error}`);
      }
    };

    await scanDir(targetPath);
    return directories;
  }

  /**
   * Calculate compliance metrics
   */
  private calculateCompliance(
    totalFiles: number,
    totalDirectories: number,
    issues: NamingIssue[]
  ): NamingComplianceReport {
    const totalItems = totalFiles + totalDirectories;
    const fileIssues = issues.filter(i => i.type === 'file-naming').length;
    const dirIssues = issues.filter(i => i.type === 'directory-naming').length;
    const identifierIssues = issues.filter(i => i.type === 'identifier-naming').length;

    const fileCompliance = totalFiles > 0 ? ((totalFiles - fileIssues) / totalFiles) * 100 : 100;
    const dirCompliance = totalDirectories > 0 ? ((totalDirectories - dirIssues) / totalDirectories) * 100 : 100;
    const identifierCompliance = 100; // Calculate based on total identifiers found

    const overall = totalItems > 0 ? ((totalItems - fileIssues - dirIssues) / totalItems) * 100 : 100;

    // Calculate category compliance
    const categories = {} as { [K in IdentifierType]: number };
    const identifierTypes: IdentifierType[] = ['interface', 'class', 'function', 'method', 'variable', 'constant', 'type', 'enum', 'property'];
    
    for (const type of identifierTypes) {
      const typeIssues = issues.filter(i => i.identifierType === type).length;
      categories[type] = 100; // Simplified - would need actual count of identifiers
    }

    return {
      overall: Math.round(overall),
      fileNaming: Math.round(fileCompliance),
      directoryNaming: Math.round(dirCompliance),
      identifierNaming: Math.round(identifierCompliance),
      categories
    };
  }

  // Naming convention helpers
  private isKebabCase(str: string): boolean {
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(str);
  }

  private isPascalCase(str: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(str);
  }

  private isCamelCase(str: string): boolean {
    return /^[a-z][a-zA-Z0-9]*$/.test(str);
  }

  private isScreamingSnakeCase(str: string): boolean {
    return /^[A-Z0-9]+(_[A-Z0-9]+)*$/.test(str);
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .replace(/[_\s]+/g, '-')
      .toLowerCase();
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
      .replace(/^(.)/, char => char.toUpperCase());
  }

  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  private toScreamingSnakeCase(str: string): string {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/[-\s]+/g, '_')
      .toUpperCase();
  }
}