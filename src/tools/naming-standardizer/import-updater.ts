/**
 * Import path updater for handling import/export path changes
 * Ensures import integrity after file renames
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import {
  ImportReference,
  PathUpdate,
  ImportUpdateResult,
  ValidationReport,
  NamingStandardizerConfig
} from './types.js';

export class ImportPathUpdater {
  private readonly config: NamingStandardizerConfig;

  constructor(config: NamingStandardizerConfig) {
    this.config = config;
  }

  /**
   * Scan all imports in a directory
   */
  async scanAllImports(directory: string): Promise<ImportReference[]> {
    const tsFiles = await glob('**/*.{ts,tsx}', {
      cwd: directory,
      ignore: this.config.excludePatterns,
      nodir: true
    });

    const imports: ImportReference[] = [];

    for (const file of tsFiles) {
      const fullPath = path.join(directory, file);
      const fileImports = await this.scanFileImports(fullPath);
      imports.push(...fileImports);
    }

    return imports;
  }

  /**
   * Scan imports in a single file
   */
  private async scanFileImports(filePath: string): Promise<ImportReference[]> {
    const imports: ImportReference[] = [];

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        const lineNumber = lineIndex + 1;

        // Match import statements
        const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
        let importMatch;
        while ((importMatch = importRegex.exec(line)) !== null) {
          const importPath = importMatch[1];
          imports.push({
            file: filePath,
            line: lineNumber,
            importPath,
            isRelative: importPath.startsWith('.')
          });
        }

        // Match export statements with from clause
        const exportRegex = /export\s+.*\s+from\s+['"]([^'"]+)['"]/g;
        let exportMatch;
        while ((exportMatch = exportRegex.exec(line)) !== null) {
          const exportPath = exportMatch[1];
          imports.push({
            file: filePath,
            line: lineNumber,
            importPath: exportPath,
            isRelative: exportPath.startsWith('.')
          });
        }

        // Match dynamic imports
        const dynamicRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        let dynamicMatch;
        while ((dynamicMatch = dynamicRegex.exec(line)) !== null) {
          const dynamicPath = dynamicMatch[1];
          imports.push({
            file: filePath,
            line: lineNumber,
            importPath: dynamicPath,
            isRelative: dynamicPath.startsWith('.')
          });
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan imports in ${filePath}: ${error}`);
    }

    return imports;
  }

  /**
   * Update import paths based on path updates
   */
  async updateImportPaths(updates: PathUpdate[]): Promise<ImportUpdateResult> {
    const filesUpdated = new Set<string>();
    let importsUpdated = 0;
    const errors: string[] = [];

    // Group updates by file
    const updatesByFile = new Map<string, PathUpdate[]>();
    for (const update of updates) {
      if (!updatesByFile.has(update.file)) {
        updatesByFile.set(update.file, []);
      }
      updatesByFile.get(update.file)!.push(update);
    }

    // Update each file
    for (const [filePath, fileUpdates] of updatesByFile) {
      try {
        const updateCount = await this.updateFileImportPaths(filePath, fileUpdates);
        if (updateCount > 0) {
          filesUpdated.add(filePath);
          importsUpdated += updateCount;
        }
      } catch (error) {
        errors.push(`Failed to update imports in ${filePath}: ${error}`);
      }
    }

    return {
      filesUpdated: filesUpdated.size,
      importsUpdated,
      errors
    };
  }

  /**
   * Update import paths in a single file
   */
  private async updateFileImportPaths(filePath: string, updates: PathUpdate[]): Promise<number> {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    let updatesApplied = 0;

    // Sort updates by line number in descending order to avoid line number shifts
    const sortedUpdates = updates.sort((a, b) => b.line - a.line);

    for (const update of sortedUpdates) {
      const lineIndex = update.line - 1;
      if (lineIndex < 0 || lineIndex >= lines.length) {
        continue;
      }

      const line = lines[lineIndex];
      const newLine = line.replace(update.oldPath, update.newPath);
      
      if (newLine !== line) {
        lines[lineIndex] = newLine;
        updatesApplied++;
      }
    }

    if (updatesApplied > 0) {
      await fs.writeFile(filePath, lines.join('\n'), 'utf-8');
    }

    return updatesApplied;
  }

  /**
   * Validate import integrity
   */
  async validateImportIntegrity(): Promise<ValidationReport> {
    const imports = await this.scanAllImports(this.config.rootDirectory);
    const brokenImports: string[] = [];
    const circularDependencies: string[][] = [];

    for (const importRef of imports) {
      // Skip non-relative imports (node_modules, etc.)
      if (!importRef.isRelative) {
        continue;
      }

      try {
        const resolvedPath = await this.resolveImportPath(importRef);
        
        // Check if the resolved file exists
        const exists = await this.fileExists(resolvedPath);
        if (!exists) {
          brokenImports.push(`${importRef.file}:${importRef.line} -> ${importRef.importPath}`);
        }
      } catch (error) {
        brokenImports.push(`${importRef.file}:${importRef.line} -> ${importRef.importPath} (${error})`);
      }
    }

    // Basic circular dependency detection
    const dependencyGraph = this.buildDependencyGraph(imports);
    const cycles = this.detectCycles(dependencyGraph);
    circularDependencies.push(...cycles);

    return {
      totalImports: imports.length,
      validImports: imports.length - brokenImports.length,
      brokenImports,
      circularDependencies
    };
  }

  /**
   * Resolve an import path to an absolute file path
   */
  private async resolveImportPath(importRef: ImportReference): Promise<string> {
    const importingDir = path.dirname(importRef.file);
    let resolvedPath = path.resolve(importingDir, importRef.importPath);

    // Try different extensions if the path doesn't exist
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    if (await this.fileExists(resolvedPath)) {
      return resolvedPath;
    }

    // Try with extensions
    for (const ext of extensions) {
      const pathWithExt = resolvedPath + ext;
      if (await this.fileExists(pathWithExt)) {
        return pathWithExt;
      }
    }

    // Try as directory with index file
    for (const ext of extensions) {
      const indexPath = path.join(resolvedPath, `index${ext}`);
      if (await this.fileExists(indexPath)) {
        return indexPath;
      }
    }

    throw new Error(`Cannot resolve import path: ${importRef.importPath}`);
  }

  /**
   * Check if a file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Build dependency graph from imports
   */
  private buildDependencyGraph(imports: ImportReference[]): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();

    for (const importRef of imports) {
      if (!importRef.isRelative) continue;

      const importer = path.resolve(importRef.file);
      
      if (!graph.has(importer)) {
        graph.set(importer, new Set());
      }

      try {
        const importingDir = path.dirname(importRef.file);
        const imported = path.resolve(importingDir, importRef.importPath);
        graph.get(importer)!.add(imported);
      } catch (error) {
        // Skip invalid import paths
      }
    }

    return graph;
  }

  /**
   * Detect circular dependencies using DFS
   */
  private detectCycles(graph: Map<string, Set<string>>): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const dfs = (node: string): boolean => {
      if (recursionStack.has(node)) {
        // Found a cycle
        const cycleStart = path.indexOf(node);
        const cycle = path.slice(cycleStart).concat(node);
        cycles.push(cycle);
        return true;
      }

      if (visited.has(node)) {
        return false;
      }

      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const neighbors = graph.get(node) || new Set();
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(node);
      path.pop();
      return false;
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return cycles;
  }

  /**
   * Generate path updates from file renames
   */
  generatePathUpdates(
    imports: ImportReference[],
    fileRenames: Map<string, string>
  ): PathUpdate[] {
    const updates: PathUpdate[] = [];

    for (const importRef of imports) {
      if (!importRef.isRelative) continue;

      try {
        const importingDir = path.dirname(importRef.file);
        const resolvedImportPath = path.resolve(importingDir, importRef.importPath);

        // Check if this imported file was renamed
        for (const [oldPath, newPath] of fileRenames) {
          const oldResolved = path.resolve(oldPath);
          
          if (resolvedImportPath === oldResolved || 
              resolvedImportPath === oldResolved.replace(/\.(ts|tsx)$/, '')) {
            
            // Calculate new relative path
            const newResolved = path.resolve(newPath);
            const newRelativePath = path.relative(importingDir, newResolved);
            const normalizedNewPath = newRelativePath.startsWith('.') ? 
              newRelativePath : `./${newRelativePath}`;

            // Remove extension if original import didn't have one
            const finalNewPath = importRef.importPath.includes('.') ? 
              normalizedNewPath : normalizedNewPath.replace(/\.(ts|tsx)$/, '');

            updates.push({
              file: importRef.file,
              line: importRef.line,
              oldPath: importRef.importPath,
              newPath: finalNewPath
            });
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not process import ${importRef.importPath} in ${importRef.file}: ${error}`);
      }
    }

    return updates;
  }
}