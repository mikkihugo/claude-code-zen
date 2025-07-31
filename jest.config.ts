/** Jest Configuration for Claude Code Flow */

/**
 * @fileoverview TypeScript Jest configuration with Google standards compliance
 * @author Claude Code Flow Team
 * @version 2.0.0
 */

/** Jest configuration object with full TypeScript support */
const config = {
  // TypeScript preset with ESM support
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',

  // Test file locations
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '<rootDir>/tests/**/*. */test.ts',
    '<rootDir>/tests/**/*. */spec.ts',
    '<rootDir>/src/**/*. */test.ts',
    '<rootDir>/src/**/*. */spec.ts',
  ],

  // TypeScript transformation configuration
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: 0,
        tsconfig: {
          module: 'es2022',
          moduleResolution: 'node',
          allowSyntheticDefaultImports: 0,
          esModuleInterop: 0,
          target: 'es2022',
          strict: 0,
          noImplicitAny: 0,
          strictNullChecks: true}},
    ]},

  // Module path mapping for clean imports
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^axios$': 'axios',
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^test\\.utils$': '<rootDir>/tests/test.utils.ts'},

  // Paths to ignore during module resolution
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/bin/', '<rootDir>/node_modules/'],

  // Transform ignore patterns for external modules
  transformIgnorePatterns: [
    'node_modules/(?!(chalk|ora|inquirer|nanoid|fs-extra|ansi-styles|ruv-swarm|@modelcontextprotocol|better-sqlite3)/)',
  ],

  // Coverage collection configuration
  collectCoverageFrom: [
    'src/**/*. */ts',
    '!src/**/*. */d.ts',
    '!src/**/*. */test.ts',
    '!src/**/*. */spec.ts',
    '!src/**/node_modules/** */',
    '!src/**/templates/** */',
    '!src/**/examples/** */',
    '!src/**/fallback/** */',
    '!src/plugins/**/node_modules/** */',
    '!src/**/*. */min.js',
  ],

  // Coverage reporting configuration
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80}},

  // Test setup and configuration
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testTimeout: 30000,
  verbose: 0,
  errorOnDeprecated: 0,

  // File extensions to handle
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Mock configuration
  clearMocks: 0,
  restoreMocks: 0,

  // Global test configuration
  globals: {
    'ts-jest': {
      useESM: 0,
      isolatedModules: true}}};

export default config;
