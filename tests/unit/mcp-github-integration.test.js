/**
 * MCP GitHub Integration Test Suite
 * Tests the Model Context Protocol integration for GitHub Copilot coding agent
 * 
 * This test suite validates that the coding agent can be invoked through MCP and successfully:
 * 1. Create a new branch
 * 2. Implement a simple change  
 * 3. Open a pull request
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { MCPGitHubIntegrationTest, runMCPGitHubIntegrationTest } from '../utils/mcp-github-integration-test.js';
import { setupTestCleanup, teardownTestCleanup } from '../utils/test-cleanup.js';
import { sleep } from '../utils/test-helpers.js';

describe('MCP GitHub Integration Tests', () => {
  let cleanup;
  
  beforeEach(() => {
    cleanup = setupTestCleanup();
    jest.setTimeout(30000); // 30 second timeout for integration tests
  });

  afterEach(async () => {
    await teardownTestCleanup();
  });

  describe('MCP Server Initialization', () => {
    it('should initialize MCP server with GitHub tools', async () => {
      const test = new MCPGitHubIntegrationTest({ mockGitHub: true });
      
      try {
        const server = await test.initializeMCPServer();
        
        expect(server).toBeDefined();
        expect(server.getHealthStatus).toBeDefined();
        
        const health = await server.getHealthStatus();
        expect(health.healthy).toBe(true);
        expect(health.metrics.registeredTools).toBeGreaterThanOrEqual(3); // At least 3 GitHub tools
        
        // Verify GitHub tools are registered
        const tools = server.toolRegistry.listTools();
        const githubTools = tools.filter(tool => tool.name.startsWith('github/'));
        expect(githubTools.length).toBeGreaterThanOrEqual(3);
        
        // Check specific tools
        const toolNames = githubTools.map(t => t.name);
        expect(toolNames).toContain('github/create_branch');
        expect(toolNames).toContain('github/implement_change');
        expect(toolNames).toContain('github/open_pull_request');
        
      } finally {
        await test.cleanup();
      }
    });

    it('should register tools with proper schemas', async () => {
      const test = new MCPGitHubIntegrationTest({ mockGitHub: true });
      
      try {
        const server = await test.initializeMCPServer();
        const tools = server.toolRegistry.listTools();
        
        const createBranchTool = tools.find(t => t.name === 'github/create_branch');
        expect(createBranchTool).toBeDefined();
        expect(createBranchTool.inputSchema.properties.branchName).toBeDefined();
        expect(createBranchTool.inputSchema.required).toContain('branchName');
        
        const implementChangeTool = tools.find(t => t.name === 'github/implement_change');
        expect(implementChangeTool).toBeDefined();
        expect(implementChangeTool.inputSchema.properties.filePath).toBeDefined();
        expect(implementChangeTool.inputSchema.properties.content).toBeDefined();
        expect(implementChangeTool.inputSchema.required).toContain('filePath');
        expect(implementChangeTool.inputSchema.required).toContain('content');
        
        const openPRTool = tools.find(t => t.name === 'github/open_pull_request');
        expect(openPRTool).toBeDefined();
        expect(openPRTool.inputSchema.properties.title).toBeDefined();
        expect(openPRTool.inputSchema.properties.headBranch).toBeDefined();
        expect(openPRTool.inputSchema.required).toContain('title');
        expect(openPRTool.inputSchema.required).toContain('headBranch');
        
      } finally {
        await test.cleanup();
      }
    });
  });

  describe('GitHub Operations through MCP', () => {
    it('should create a branch through MCP tool', async () => {
      const test = new MCPGitHubIntegrationTest({ mockGitHub: true });
      
      try {
        const server = await test.initializeMCPServer();
        
        const result = await server.executeTool('github/create_branch', {
          branchName: 'feature-test'
        });
        
        expect(result.success).toBe(true);
        expect(result.branchName).toContain('test-mcp-integration-feature-test');
        expect(result.created).toBe(true);
        expect(result.sha).toBeDefined();
        expect(result.message).toContain('created successfully');
        
      } finally {
        await test.cleanup();
      }
    });

    it('should implement changes through MCP tool', async () => {
      const test = new MCPGitHubIntegrationTest({ mockGitHub: true });
      
      try {
        const server = await test.initializeMCPServer();
        
        const result = await server.executeTool('github/implement_change', {
          filePath: 'test-file.js',
          content: '// Test content\nconsole.log("Hello MCP");',
          operation: 'create'
        });
        
        expect(result.success).toBe(true);
        expect(result.filePath).toBe('test-file.js');
        expect(result.operation).toBe('create');
        expect(result.bytesWritten).toBeGreaterThan(0);
        expect(result.message).toContain('Successfully created file');
        
      } finally {
        await test.cleanup();
      }
    });

    it('should open pull request through MCP tool', async () => {
      const test = new MCPGitHubIntegrationTest({ mockGitHub: true });
      
      try {
        const server = await test.initializeMCPServer();
        
        const result = await server.executeTool('github/open_pull_request', {
          title: 'Test PR from MCP',
          description: 'This is a test PR created through MCP',
          headBranch: 'feature-branch',
          baseBranch: 'main'
        });
        
        expect(result.success).toBe(true);
        expect(result.pullRequest).toBeDefined();
        expect(result.pullRequest.title).toBe('Test PR from MCP');
        expect(result.pullRequest.headBranch).toBe('feature-branch');
        expect(result.pullRequest.baseBranch).toBe('main');
        expect(result.pullRequest.number).toBeGreaterThan(0);
        expect(result.message).toContain('created successfully');
        
      } finally {
        await test.cleanup();
      }
    });
  });

  describe('Complete Integration Workflow', () => {
    it('should execute complete MCP GitHub integration test workflow', async () => {
      const results = await runMCPGitHubIntegrationTest({
        testName: 'complete-workflow-test',
        mockGitHub: true
      });
      
      expect(results.success).toBe(true);
      expect(results.steps).toHaveLength(4);
      expect(results.validation.valid).toBe(true);
      expect(results.validation.issues).toHaveLength(0);
      
      // Verify all steps completed
      const stepNames = results.steps.map(s => s.step);
      expect(stepNames).toContain('initialize_mcp');
      expect(stepNames).toContain('create_branch');
      expect(stepNames).toContain('implement_change');
      expect(stepNames).toContain('open_pull_request');
      
      // All steps should be completed
      const completedSteps = results.steps.filter(s => s.status === 'completed');
      expect(completedSteps).toHaveLength(4);
      
      // Check that branch was created
      const branchStep = results.steps.find(s => s.step === 'create_branch');
      expect(branchStep.result.success).toBe(true);
      expect(branchStep.branchName).toContain('complete-workflow-test');
      
      // Check that change was implemented
      const changeStep = results.steps.find(s => s.step === 'implement_change');
      expect(changeStep.result.success).toBe(true);
      expect(changeStep.result.filePath).toContain('mcp-test-');
      
      // Check that PR was opened
      const prStep = results.steps.find(s => s.step === 'open_pull_request');
      expect(prStep.result.success).toBe(true);
      expect(prStep.result.pullRequest.title).toContain('complete-workflow-test');
    });

    it('should validate performance metrics', async () => {
      const results = await runMCPGitHubIntegrationTest({
        testName: 'performance-test',
        mockGitHub: true
      });
      
      expect(results.success).toBe(true);
      expect(results.totalDuration).toBeDefined();
      expect(results.totalDuration).toBeGreaterThan(0);
      expect(results.totalDuration).toBeLessThan(30000); // Should complete within 30s
      
      expect(results.validation.metrics.totalDuration).toBeDefined();
      expect(results.validation.metrics.averageStepDuration).toBeDefined();
      expect(results.validation.metrics.mcpInitializationTime).toBeDefined();
      
      // Each step should complete reasonably quickly
      for (const step of results.steps) {
        if (step.duration) {
          expect(step.duration).toBeLessThan(10000); // Max 10s per step
        }
      }
    });

    it('should handle errors gracefully', async () => {
      const test = new MCPGitHubIntegrationTest({ mockGitHub: true });
      
      try {
        const server = await test.initializeMCPServer();
        
        // Test with invalid parameters
        const result = await server.executeTool('github/create_branch', {
          // Missing required branchName parameter
        });
        
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        
      } finally {
        await test.cleanup();
      }
    });
  });

  describe('Test Cleanup and Resource Management', () => {
    it('should properly clean up resources after test execution', async () => {
      const test = new MCPGitHubIntegrationTest({ mockGitHub: true });
      
      // Execute test
      await test.initializeMCPServer();
      
      // Verify server is running
      expect(test.server).toBeDefined();
      const healthBefore = await test.server.getHealthStatus();
      expect(healthBefore.healthy).toBe(true);
      
      // Clean up
      await test.cleanup();
      
      // Verify cleanup happened
      const stats = test.cleanup.getStats();
      expect(stats.timers).toBe(0);
      expect(stats.intervals).toBe(0);
      expect(stats.promises).toBe(0);
      expect(stats.mocks).toBe(0);
      expect(stats.resources).toBe(0);
    });

    it('should validate test utility integration with cleanup system', async () => {
      const results = await runMCPGitHubIntegrationTest({
        testName: 'cleanup-validation-test',
        mockGitHub: true
      });
      
      expect(results.success).toBe(true);
      
      // Test should complete without leaving resources
      // This is validated by the cleanup happening in the finally block
      expect(results.validation.valid).toBe(true);
    });
  });

  describe('MCP Tool Discovery and Capabilities', () => {
    it('should support tool discovery for GitHub operations', async () => {
      const test = new MCPGitHubIntegrationTest({ mockGitHub: true });
      
      try {
        const server = await test.initializeMCPServer();
        const tools = server.toolRegistry.listTools();
        
        // Check tool categories and capabilities
        const githubTools = tools.filter(t => t.name.startsWith('github/'));
        expect(githubTools.length).toBeGreaterThanOrEqual(3);
        
        // Verify each tool has required properties
        for (const tool of githubTools) {
          expect(tool.name).toBeDefined();
          expect(tool.description).toBeDefined();
          expect(tool.inputSchema).toBeDefined();
          expect(tool.handler).toBeDefined();
          expect(typeof tool.handler).toBe('function');
        }
        
      } finally {
        await test.cleanup();
      }
    });
  });
});

// Performance test specifically for MCP integration
describe('MCP GitHub Integration Performance Tests', () => {
  it('should complete GitHub workflow in reasonable time', async () => {
    const startTime = Date.now();
    
    const results = await runMCPGitHubIntegrationTest({
      testName: 'performance-benchmark',
      mockGitHub: true
    });
    
    const totalTime = Date.now() - startTime;
    
    expect(results.success).toBe(true);
    expect(totalTime).toBeLessThan(15000); // Complete within 15 seconds
    expect(results.validation.valid).toBe(true);
    
    // Log performance for debugging if needed
    if (process.env.DEBUG_PERFORMANCE) {
      console.log('MCP Integration Performance:', {
        totalTime: `${totalTime}ms`,
        testDuration: `${results.totalDuration}ms`,
        steps: results.steps.length,
        averageStepTime: `${results.validation.metrics.averageStepDuration}ms`
      });
    }
  });
});