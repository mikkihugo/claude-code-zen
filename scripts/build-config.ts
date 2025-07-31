/**
 * Build Configuration for Claude Zen
 * @fileoverview
 * TypeScript build configuration with Google standards
 * @author Claude Code Flow Team
 * @version 2.0.0
 */

/** Module alias configuration for build system */
interface ModuleAliases {
  [pattern: string]: string;
}

/** Build configuration interface */
interface BuildConfiguration {
  moduleAliases: ModuleAliases;
  excludeModules: string[];
  externals: string[];
}

/** Build configuration for dual Node.js/Deno support */
/** Handles module resolution and bundling exclusions */
export const buildConfig: BuildConfiguration = {
  // Module aliases for Node.js build compatibility
  moduleAliases: {
    '@cliffy/ansi/colors': './src/adapters/cliffy-node.js',
    '@cliffy/ansi': './src/adapters/cliffy-node.js',
    '@cliffy/command': './src/adapters/cliffy-node.js',
    '@cliffy/table': './src/adapters/cliffy-node.js',
    '@std/path': './src/adapters/std-path-node.js',
    '@std/fs': './src/adapters/std-fs-node.js',
    '@std/encoding': './src/adapters/std-encoding-node.js'
  },

  // Modules to exclude from bundling
  excludeModules: [
    'node:fs',
    'node:path',
    'node:process',
    'node:crypto',
    'node:os',
    'node:url',
    'node:util',
    'node:events',
    'node:stream',
    'node:buffer',
    'node:child_process'
  ],

  // External dependencies that should not be bundled
  externals: [
    'typescript',
    'eslint',
    '@typescript-eslint/parser',
    '@typescript-eslint/eslint-plugin',
    'jest',
    'prettier',
    'husky',
    'lint-staged',
    'nodemon',
    'concurrently'
  ]
};

/** Development build configuration */
export const devConfig: BuildConfiguration = {
  ...buildConfig,
  externals: [
    ...buildConfig.externals,
    'webpack',
    'webpack-dev-server',
    'ts-loader',
    'source-map-loader'
  ]
};

/** Production build configuration */
export const prodConfig: BuildConfiguration = {
  ...buildConfig,
  excludeModules: [
    ...buildConfig.excludeModules,
    'source-map-support'
  ]
};

export default buildConfig;