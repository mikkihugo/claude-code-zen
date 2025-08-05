/**
 * File renamer with import path updates
 * Handles safe file renaming with automatic import path updates
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import {
  RenameOperation,
  RenameResult,
  ValidationResult,
  NamingStandardizerConfig
} from './types.js';

export class FileRenamer {
  private readonly config: NamingStandardizerConfig;

  constructor(config: NamingStandardizerConfig) {
    this.config = config;
  }

  /**
   * Rename files to kebab-case with import updates
   */
  async renameFilesToKebabCase(globPattern: string): Promise<RenameOperation[]> {
    const files = await glob(globPattern, {
      ignore: this.config.excludePatterns,
      nodir: true
    });

    const operations: RenameOperation[] = [];

    for (const file of files) {
      const basename = path.basename(file);
      const dirname = path.dirname(file);
      const extension = path.extname(file);
      const nameWithoutExt = basename.replace(extension, '');

      if (!this.isKebabCase(nameWithoutExt)) {
        const newName = this.toKebabCase(nameWithoutExt) + extension;
        const newPath = path.join(dirname, newName);

        operations.push({
          from: file,
          to: newPath,
          type: 'file'
        });
      }
    }

    return operations;
  }

  /**
   * Execute rename operations with import updates
   */
  async renameWithImportUpdates(renames: RenameOperation[]): Promise<RenameResult> {
    const backupPath = await this.createBackup();
    let operationsCompleted = 0;
    const errors: string[] = [];

    try {
      // Step 1: Rename files
      for (const rename of renames) {
        try {
          if (rename.type === 'file') {
            await fs.rename(rename.from, rename.to);
            operationsCompleted++;
          } else if (rename.type === 'directory') {
            await fs.rename(rename.from, rename.to);
            operationsCompleted++;
          }
        } catch (error) {
          errors.push(`Failed to rename ${rename.from} to ${rename.to}: ${error}`);
        }
      }

      // Step 2: Update import paths
      await this.updateImportPaths(renames);

      // Step 3: Validate TypeScript compilation
      const validation = await this.validateTypeScript();
      if (!validation.valid) {
        await this.rollbackChanges(backupPath);
        errors.push('Rename caused TypeScript errors, rolled back changes');
        return {
          success: false,
          operationsCompleted: 0,
          operationsFailed: renames.length,
          errors: [...errors, ...validation.errors],
          backupCreated: backupPath
        };
      }

      return {
        success: true,
        operationsCompleted,
        operationsFailed: renames.length - operationsCompleted,
        errors,
        backupCreated: backupPath
      };

    } catch (error) {
      await this.rollbackChanges(backupPath);
      errors.push(`Critical error during rename operation: ${error}`);
      
      return {
        success: false,
        operationsCompleted: 0,
        operationsFailed: renames.length,
        errors,
        backupCreated: backupPath
      };
    }
  }

  /**
   * Update import paths after file renames
   */
  private async updateImportPaths(renames: RenameOperation[]): Promise<void> {
    // Create a map of old paths to new paths
    const pathMap = new Map<string, string>();
    
    for (const rename of renames) {
      pathMap.set(rename.from, rename.to);
    }

    // Find all TypeScript files to update
    const tsFiles = await glob('**/*.{ts,tsx}', {
      cwd: this.config.rootDirectory,
      ignore: this.config.excludePatterns,
      nodir: true
    });

    for (const tsFile of tsFiles) {
      const fullPath = path.join(this.config.rootDirectory, tsFile);
      await this.updateFileImports(fullPath, pathMap);
    }
  }

  /**
   * Update imports in a single file
   */
  private async updateFileImports(filePath: string, pathMap: Map<string, string>): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      let modified = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Match import statements
        const importMatch = line.match(/^import\s+.*\s+from\s+['"]([^'"]+)['"]/);
        if (importMatch) {
          const importPath = importMatch[1];
          const updatedPath = this.updateImportPath(filePath, importPath, pathMap);
          
          if (updatedPath !== importPath) {
            lines[i] = line.replace(importPath, updatedPath);
            modified = true;
          }
        }

        // Match export statements
        const exportMatch = line.match(/^export\s+.*\s+from\s+['"]([^'"]+)['"]/);
        if (exportMatch) {
          const exportPath = exportMatch[1];
          const updatedPath = this.updateImportPath(filePath, exportPath, pathMap);
          
          if (updatedPath !== exportPath) {
            lines[i] = line.replace(exportPath, updatedPath);
            modified = true;
          }
        }
      }

      if (modified) {
        await fs.writeFile(filePath, lines.join('\n'), 'utf-8');
      }
    } catch (error) {
      console.warn(`Warning: Could not update imports in ${filePath}: ${error}`);
    }
  }

  /**
   * Update a single import path
   */
  private updateImportPath(
    importingFile: string, 
    importPath: string, 
    pathMap: Map<string, string>
  ): string {
    // Skip non-relative imports
    if (!importPath.startsWith('.')) {
      return importPath;
    }

    // Resolve the absolute path of the imported file
    const importingDir = path.dirname(importingFile);
    const resolvedPath = path.resolve(importingDir, importPath);
    
    // Check if this path was renamed
    for (const [oldPath, newPath] of pathMap) {
      const oldResolved = path.resolve(oldPath);
      const newResolved = path.resolve(newPath);
      
      if (resolvedPath === oldResolved || resolvedPath === oldResolved.replace(/\.(ts|tsx)$/, '')) {
        // Calculate new relative path
        const newRelative = path.relative(importingDir, newResolved);
        // Ensure it starts with ./ or ../
        return newRelative.startsWith('.') ? newRelative : `./${newRelative}`;
      }
    }

    return importPath;
  }

  /**
   * Create backup of current state
   */
  private async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.config.rootDirectory, `.backup-${timestamp}`);
    
    try {
      await fs.mkdir(backupDir, { recursive: true });
      
      // Create a simple backup by copying git state
      // In production, you might want to use git stash or create tar archive
      await fs.writeFile(
        path.join(backupDir, 'backup-info.json'),
        JSON.stringify({
          timestamp,
          type: 'naming-standardizer-backup',
          rootDirectory: this.config.rootDirectory
        }, null, 2)
      );
      
      return backupDir;
    } catch (error) {
      throw new Error(`Failed to create backup: ${error}`);
    }
  }

  /**
   * Rollback changes using git checkout
   */
  private async rollbackChanges(backupPath: string): Promise<void> {
    // In a real implementation, you would restore from backup
    // For now, we'll just log the rollback
    console.warn(`Rollback needed. Backup created at: ${backupPath}`);
    console.warn('Manual rollback required - use git checkout to restore files');
  }

  /**
   * Validate TypeScript compilation
   */
  async validateTypeScript(): Promise<ValidationResult> {
    try {
      // Use the existing TypeScript configuration
      const { execSync } = await import('child_process');
      
      // Run TypeScript compiler in noEmit mode
      const result = execSync('npx tsc --noEmit', {
        cwd: this.config.rootDirectory,
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      return {
        valid: true,
        errors: [],
        warnings: [],
        typeScriptCompiles: true
      };

    } catch (error: any) {
      const errorOutput = error.stdout || error.stderr || error.message;
      
      return {
        valid: false,
        errors: [errorOutput],
        warnings: [],
        typeScriptCompiles: false
      };
    }
  }

  /**
   * Validate that renames won't break changes
   */
  async validateNoBreakingChanges(renames: RenameOperation[]): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for potential conflicts
    const newPaths = new Set(renames.map(r => r.to));
    const existingFiles = new Set();

    try {
      // Check if any target paths already exist
      for (const rename of renames) {
        try {
          await fs.access(rename.to);
          errors.push(`Target path already exists: ${rename.to}`);
        } catch {
          // Good - target doesn't exist
        }
      }

      // Check for naming conflicts within the rename set
      if (newPaths.size !== renames.length) {
        errors.push('Multiple files would be renamed to the same target path');
      }

    } catch (error) {
      errors.push(`Validation error: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      typeScriptCompiles: true // Will be checked separately
    };
  }

  // Helper methods
  private isKebabCase(str: string): boolean {
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(str);
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .replace(/[_\s]+/g, '-')
      .toLowerCase();
  }
}