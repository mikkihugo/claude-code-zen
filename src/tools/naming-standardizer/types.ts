/**
 * Types for naming standardization tools
 * Following Google TypeScript Style Guide conventions
 */

export type NamingIssueType = 
  | 'file-naming'
  | 'directory-naming'
  | 'identifier-naming'
  | 'import-path';

export type NamingConvention = 
  | 'kebab-case'
  | 'camelCase'
  | 'PascalCase'
  | 'SCREAMING_SNAKE_CASE';

export type IdentifierType =
  | 'interface'
  | 'class'
  | 'function'
  | 'method'
  | 'variable'
  | 'constant'
  | 'type'
  | 'enum'
  | 'property';

export interface NamingIssue {
  readonly type: NamingIssueType;
  readonly file: string;
  readonly line?: number;
  readonly column?: number;
  readonly current: string;
  readonly suggested: string;
  readonly convention: NamingConvention;
  readonly identifierType?: IdentifierType;
  readonly severity: 'error' | 'warning' | 'info';
}

export interface RenameOperation {
  readonly from: string;
  readonly to: string;
  readonly type: 'file' | 'directory';
}

export interface ImportReference {
  readonly file: string;
  readonly line: number;
  readonly importPath: string;
  readonly isRelative: boolean;
}

export interface PathUpdate {
  readonly file: string;
  readonly line: number;
  readonly oldPath: string;
  readonly newPath: string;
}

export interface NamingAnalysisResult {
  readonly totalFiles: number;
  readonly totalDirectories: number;
  readonly issues: NamingIssue[];
  readonly compliance: NamingComplianceReport;
}

export interface NamingComplianceReport {
  readonly overall: number; // 0-100 percentage
  readonly fileNaming: number;
  readonly directoryNaming: number;
  readonly identifierNaming: number;
  readonly categories: {
    readonly [K in IdentifierType]: number;
  };
}

export interface RenameScript {
  readonly operations: RenameOperation[];
  readonly importUpdates: PathUpdate[];
  readonly estimatedChanges: number;
  readonly backupPath: string;
}

export interface RenameResult {
  readonly success: boolean;
  readonly operationsCompleted: number;
  readonly operationsFailed: number;
  readonly errors: string[];
  readonly backupCreated: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: string[];
  readonly warnings: string[];
  readonly typeScriptCompiles: boolean;
}

export interface ImportUpdateResult {
  readonly filesUpdated: number;
  readonly importsUpdated: number;
  readonly errors: string[];
}

export interface ValidationReport {
  readonly totalImports: number;
  readonly validImports: number;
  readonly brokenImports: string[];
  readonly circularDependencies: string[][];
}

export interface NamingStandardizerConfig {
  readonly rootDirectory: string;
  readonly includePatterns: string[];
  readonly excludePatterns: string[];
  readonly fileExtensions: string[];
  readonly enabledRules: {
    readonly fileNaming: boolean;
    readonly directoryNaming: boolean;
    readonly interfaceNaming: boolean;
    readonly classNaming: boolean;
    readonly functionNaming: boolean;
    readonly variableNaming: boolean;
    readonly constantNaming: boolean;
    readonly typeNaming: boolean;
  };
  readonly conventions: {
    readonly files: NamingConvention;
    readonly directories: NamingConvention;
    readonly interfaces: NamingConvention;
    readonly classes: NamingConvention;
    readonly functions: NamingConvention;
    readonly variables: NamingConvention;
    readonly constants: NamingConvention;
    readonly types: NamingConvention;
  };
}