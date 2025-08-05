import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 30000, // 30 seconds per test

  transform: {
    '^.+\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },

  moduleNameMapper: {
    // Map TypeScript path aliases
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/src/',
    }),
  },

  // Use custom resolver approach
  resolver: '<rootDir>/tests/jest-resolver.cjs',

  // Remove custom resolver
  // resolver: '<rootDir>/tests/jest-resolver.cjs',

  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '<rootDir>/tests/**/*.test.ts', 
    '<rootDir>/src/__tests__/**/*.test.ts',
    '<rootDir>/src/__tests__/**/*.test.js'
  ],

  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.ts',
    '<rootDir>/tests/setup-london.ts',
    '<rootDir>/tests/setup-classical.ts',
    '<rootDir>/tests/setup-hybrid.ts'
  ],
  
  // Configure jest-extended
  setupFilesAfterEnv: [
    'jest-extended/all',
    '<rootDir>/tests/setup.ts',
    '<rootDir>/tests/setup-london.ts',
    '<rootDir>/tests/setup-classical.ts',
    '<rootDir>/tests/setup-hybrid.ts'
  ],
};

export default config;
