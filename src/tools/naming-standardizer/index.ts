/**
 * Naming standardizer tools - main exports
 * Implements automated naming convention standardization as specified in GitHub issue
 */

export { NamingStandardizer } from './naming-standardizer.js';
export { NamingAnalyzer } from './naming-analyzer.js';
export { FileRenamer } from './file-renamer.js';
export { ImportPathUpdater } from './import-updater.js';
export { NamingValidator } from './naming-validator.js';

export * from './types.js';

// Re-export the main interfaces required by the issue
export type {
  // Core interfaces from the issue requirements
  NamingStandardizer as NamingStandardizerInterface,
  FileRenamer as FileRenamerInterface,
  ImportPathUpdater as ImportPathUpdaterInterface
} from './types.js';

// Default configuration for the standardizer
export const DEFAULT_NAMING_CONFIG = {
  rootDirectory: process.cwd(),
  includePatterns: ['**/*.ts', '**/*.tsx'],
  excludePatterns: [
    '**/node_modules/**',
    '**/dist/**', 
    '**/*.d.ts',
    '**/build/**',
    '**/.git/**'
  ],
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
    files: 'kebab-case' as const,
    directories: 'kebab-case' as const,
    interfaces: 'PascalCase' as const,
    classes: 'PascalCase' as const,
    functions: 'camelCase' as const,
    variables: 'camelCase' as const,
    constants: 'SCREAMING_SNAKE_CASE' as const,
    types: 'PascalCase' as const
  }
};