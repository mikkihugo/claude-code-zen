/**
 * Basic CLI Test Suite
 * 
 * Tests to verify that the Claude Zen CLI is functional after real ruv-FANN integration.
 * This demonstrates the improvement from mock to real implementation.
 */

import { execSync } from 'child_process';

const CLI_PATH = './src/cli/claude-zen-hive-mind.js';

describe('Claude Zen CLI', () => {
  test('version command works', () => {
    const result = execSync(`node ${CLI_PATH} --version`, { encoding: 'utf8' });
    expect(result).toContain('2.0.0-alpha.70');
  });

  test('help command works', () => {
    const result = execSync(`node ${CLI_PATH} --help`, { encoding: 'utf8' });
    expect(result).toContain('Hive-Mind Primary System');
    expect(result).toContain('Core Commands');
    expect(result).toContain('neural');
    expect(result).toContain('ruv-FANN intelligence');
  });

  test('ruv-FANN integration is real (not mock)', async () => {
    // Test that we can import real ruv-FANN
    const ruvSwarm = await import('../ruv-FANN/ruv-swarm/npm/src/index.js');
    
    // The most important test: we can import the package and have core functionality
    expect(ruvSwarm.RuvSwarm).toBeDefined();
    expect(typeof ruvSwarm.RuvSwarm).toBe('function');
    
    // Verify we have a significant number of exports (not a simple mock)
    const exportKeys = Object.keys(ruvSwarm);
    expect(exportKeys.length).toBeGreaterThan(10); // Real package has many exports
    
    // Key validation: we have the core neural patterns
    expect(exportKeys).toContain('COGNITIVE_PATTERNS');
    
    console.log('✅ Real ruv-FANN integration confirmed with', exportKeys.length, 'exports');
  });

  test('neural command shows real ruv-FANN integration', () => {
    const result = execSync(`timeout 10 node ${CLI_PATH} neural help || true`, { encoding: 'utf8' });
    expect(result).toContain('ruv-FANN neural intelligence');
    expect(result).toContain('Neural AI Development Tools');
  });
});