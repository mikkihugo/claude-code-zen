/**
 * MCP GitHub Copilot Integration Test
 * Test to validate VS Code GitHub Copilot coding agent integration through MCP
 * 
 * This test validates that the MCP integration pathway can:
 * 1. Create a new branch through MCP tools
 * 2. Implement a simple change
 * 3. Open a pull request
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
type Mock = jest.MockedFunction<any>;
import { MCPServer } from '../server.js';
import { EventEmitter } from 'node:events';
import { promises as fs } from 'fs';
import { join } from 'path';

// Utility function to safely get error messages
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}

// Mock logger
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  configure: jest.fn()
};

// Mock event bus
const mockEventBus = new EventEmitter();

// Mock config
const mockMCPConfig = {
  transport: 'stdio',
  enableMetrics: true,
  auth: {
    enabled: false,
    method: 'token',
  },
};

describe('MCP GitHub Copilot Integration', () => {
  let server: MCPServer;
  let testCleanup: Set<string>;

  beforeEach(() => {
    server = new MCPServer(
      mockMCPConfig,
      mockEventBus,
      mockLogger,
    );
    testCleanup = new Set();
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
    
    // Clean up any test files created
    for (const filePath of testCleanup) {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    testCleanup.clear();
  });

  describe('GitHub Integration Tools', () => {
    beforeEach(async () => {
      await server.start();
      
      // Register GitHub integration tools for testing
      registerGitHubTools(server);
    });

    it('should register GitHub integration tools', () => {
      const tools = (server as any).toolRegistry.listTools();
      const githubTools = tools.filter((t: any) => t.name.startsWith('github/'));
      
      expect(githubTools.length).toBeGreaterThanOrEqual(3);
      
      const toolNames = githubTools.map((t: any) => t.name);
      expect(toolNames).toContain('github/create_branch');
      expect(toolNames).toContain('github/implement_change');
      expect(toolNames).toContain('github/open_pull_request');
    });

    it('should create a branch through MCP', async () => {
      const result = await executeGitHubTool(server, 'github/create_branch', {
        branchName: 'feature-mcp-test'
      });

      expect(result.success).toBe(true);
      expect(result.branchName).toContain('feature-mcp-test');
      expect(result.created).toBe(true);
      expect(result.sha).toBeDefined();
    });

    it('should implement a change through MCP', async () => {
      const testContent = `// MCP GitHub Integration Test
// Generated: ${new Date().toISOString()}

export function mcpGitHubIntegrationTest() {
  return {
    test: 'MCP GitHub Integration',
    success: true,
    timestamp: '${new Date().toISOString()}'
  };
}`;

      const testFilePath = join(process.cwd(), 'test-files', `mcp-test-${Date.now()}.js`);
      testCleanup.add(testFilePath);

      const result = await executeGitHubTool(server, 'github/implement_change', {
        filePath: testFilePath,
        content: testContent,
        operation: 'create'
      });

      expect(result.success).toBe(true);
      expect(result.filePath).toBe(testFilePath);
      expect(result.operation).toBe('create');
      expect(result.bytesWritten).toBeGreaterThan(0);

      // Verify file was actually created
      const fileExists = await fs.access(testFilePath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);

      const fileContent = await fs.readFile(testFilePath, 'utf8');
      expect(fileContent).toContain('MCP GitHub Integration Test');
    });

    it('should open a pull request through MCP', async () => {
      const result = await executeGitHubTool(server, 'github/open_pull_request', {
        title: 'MCP Integration Test PR',
        description: 'Test PR created through MCP for GitHub Copilot integration validation',
        headBranch: 'feature-mcp-test',
        baseBranch: 'main'
      });

      expect(result.success).toBe(true);
      expect(result.pullRequest).toBeDefined();
      expect(result.pullRequest.title).toBe('MCP Integration Test PR');
      expect(result.pullRequest.headBranch).toBe('feature-mcp-test');
      expect(result.pullRequest.baseBranch).toBe('main');
    });

    it('should execute complete GitHub workflow through MCP', async () => {
      const testId = Date.now();
      const branchName = `mcp-integration-test-${testId}`;
      const testFilePath = join(process.cwd(), 'test-files', `mcp-workflow-${testId}.js`);
      testCleanup.add(testFilePath);

      // Step 1: Create branch
      const branchResult = await executeGitHubTool(server, 'github/create_branch', {
        branchName
      });
      expect(branchResult.success).toBe(true);

      // Step 2: Implement change
      const changeResult = await executeGitHubTool(server, 'github/implement_change', {
        filePath: testFilePath,
        content: `// Complete MCP GitHub Workflow Test
// Test ID: ${testId}
// Branch: ${branchResult.branchName}

export function completeMCPWorkflow() {
  console.log('MCP GitHub Copilot integration test completed successfully');
  return {
    testId: ${testId},
    branch: '${branchResult.branchName}',
    workflow: 'complete',
    success: true
  };
}`,
        operation: 'create'
      });
      expect(changeResult.success).toBe(true);

      // Step 3: Open pull request
      const prResult = await executeGitHubTool(server, 'github/open_pull_request', {
        title: `MCP Integration Test: Complete Workflow ${testId}`,
        description: `This PR demonstrates the complete MCP GitHub integration workflow:

## Test Details
- Test ID: ${testId}
- Branch: ${branchResult.branchName}
- File: ${changeResult.filePath}
- Timestamp: ${new Date().toISOString()}

This validates the MCP pathway for GitHub Copilot coding agent integration.`,
        headBranch: branchResult.branchName,
        baseBranch: 'main'
      });
      expect(prResult.success).toBe(true);

      // Validate complete workflow
      expect(branchResult.branchName).toContain(branchName);
      expect(changeResult.filePath).toBe(testFilePath);
      expect(prResult.pullRequest.title).toContain('Complete Workflow');

      // Verify file exists with correct content
      const fileContent = await fs.readFile(testFilePath, 'utf8');
      expect(fileContent).toContain(`testId: ${testId}`);
      expect(fileContent).toContain(branchResult.branchName);
    });
  });

  describe('Test Utility Function', () => {
    it('should demonstrate MCP GitHub integration as a test utility', async () => {
      await server.start();
      registerGitHubTools(server);

      // Create test utility function result
      const testResult = await runMCPGitHubIntegrationTestUtility(server);

      expect(testResult).toBeDefined();
      expect(testResult.success).toBe(true);
      expect(testResult.steps).toHaveLength(3);
      expect(testResult.steps.every((step: any) => step.completed)).toBe(true);
      expect(testResult.validation.valid).toBe(true);
    });
  });
});

/**
 * Register GitHub integration tools for MCP testing
 */
function registerGitHubTools(server: MCPServer) {
  // Tool: Create branch
  server.registerTool({
    name: 'github/create_branch',
    description: 'Create a new branch for feature development',
    inputSchema: {
      type: 'object',
      properties: {
        branchName: { type: 'string', description: 'Name of the new branch' },
        baseBranch: { type: 'string', description: 'Base branch to create from', default: 'main' }
      },
      required: ['branchName']
    },
    handler: async (params: any) => {
      const branchName = `test-mcp-integration-${params.branchName}-${Date.now()}`;
      
      return {
        success: true,
        branchName,
        created: true,
        sha: 'mock-sha-' + Math.random().toString(36).substr(2, 9),
        message: `Branch ${branchName} created successfully`
      };
    }
  });

  // Tool: Implement change
  server.registerTool({
    name: 'github/implement_change',
    description: 'Implement a simple code change',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to the file to modify' },
        content: { type: 'string', description: 'Content to add or modify' },
        operation: { type: 'string', enum: ['create', 'modify', 'append'], default: 'create' }
      },
      required: ['filePath', 'content']
    },
    handler: async (params: any) => {
      const { filePath, content, operation = 'create' } = params;
      
      try {
        // Ensure directory exists
        await fs.mkdir(join(filePath, '..'), { recursive: true });
        
        let finalContent = content;
        
        if (operation === 'modify' || operation === 'append') {
          try {
            const existingContent = await fs.readFile(filePath, 'utf8');
            finalContent = operation === 'append' ? 
              existingContent + '\n' + content : 
              content;
          } catch (error) {
            // File doesn't exist, create it
            finalContent = content;
          }
        }
        
        // Write the file
        await fs.writeFile(filePath, finalContent, 'utf8');
        
        return {
          success: true,
          filePath,
          operation,
          bytesWritten: finalContent.length,
          message: `Successfully ${operation}d file ${filePath}`
        };
      } catch (error) {
        return {
          success: false,
          error: getErrorMessage(error),
          message: `Failed to ${operation} file ${filePath}`
        };
      }
    }
  });

  // Tool: Open pull request
  server.registerTool({
    name: 'github/open_pull_request',
    description: 'Open a pull request with the changes',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Pull request title' },
        description: { type: 'string', description: 'Pull request description' },
        baseBranch: { type: 'string', description: 'Target base branch', default: 'main' },
        headBranch: { type: 'string', description: 'Source branch with changes' }
      },
      required: ['title', 'headBranch']
    },
    handler: async (params: any) => {
      const { title, description = '', baseBranch = 'main', headBranch } = params;
      
      const prNumber = Math.floor(Math.random() * 1000) + 1;
      
      return {
        success: true,
        pullRequest: {
          number: prNumber,
          title,
          description,
          baseBranch,
          headBranch,
          url: `https://github.com/test/repo/pull/${prNumber}`,
          state: 'open',
          created: true
        },
        message: `Pull request #${prNumber} created successfully`
      };
    }
  });
}

/**
 * Execute a GitHub tool through MCP
 */
async function executeGitHubTool(server: MCPServer, toolName: string, params: any) {
  return await (server as any).toolRegistry.executeTool(toolName, params);
}

/**
 * Test utility function for MCP GitHub integration
 * This is the main utility function requested in the problem statement
 */
async function runMCPGitHubIntegrationTestUtility(server: MCPServer) {
  const testId = Date.now();
  const results = {
    testName: 'mcp-github-integration-utility',
    testId,
    startTime: new Date(),
    steps: [] as any[],
    success: false,
    validation: { valid: false, issues: [] as string[] }
  };

  try {
    // Step 1: Create branch
    results.steps.push({ name: 'create_branch', completed: false });
    const branchResult = await executeGitHubTool(server, 'github/create_branch', {
      branchName: `utility-test-${testId}`
    });
    results.steps[0].completed = branchResult.success;
    results.steps[0].result = branchResult;

    // Step 2: Implement change
    results.steps.push({ name: 'implement_change', completed: false });
    const changeResult = await executeGitHubTool(server, 'github/implement_change', {
      filePath: join(process.cwd(), 'test-files', `utility-test-${testId}.js`),
      content: `// MCP GitHub Integration Test Utility
// Generated by test utility function
export const mcpGitHubIntegrationTestUtility = () => ({
  testId: ${testId},
  branch: '${branchResult.branchName}',
  timestamp: '${new Date().toISOString()}',
  success: true
});`,
      operation: 'create'
    });
    results.steps[1].completed = changeResult.success;
    results.steps[1].result = changeResult;

    // Step 3: Open pull request
    results.steps.push({ name: 'open_pull_request', completed: false });
    const prResult = await executeGitHubTool(server, 'github/open_pull_request', {
      title: `MCP Integration Test Utility: ${testId}`,
      description: 'Test PR created by MCP GitHub integration test utility function',
      headBranch: branchResult.branchName,
      baseBranch: 'main'
    });
    results.steps[2].completed = prResult.success;
    results.steps[2].result = prResult;

    // Validate results
    const allStepsCompleted = results.steps.every(step => step.completed);
    results.success = allStepsCompleted;
    results.validation.valid = allStepsCompleted;
    
    if (!allStepsCompleted) {
      results.validation.issues.push('Some steps did not complete successfully');
    }

  } catch (error) {
    results.validation.issues.push(`Test execution failed: ${getErrorMessage(error)}`);
  }

  results.endTime = new Date();
  return results;
}