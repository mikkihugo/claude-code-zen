# MCP Configuration for Claude Code Zen

This directory contains the Model Context Protocol (MCP) configuration for optimal GitHub Copilot integration and enhanced development workflow.

## Configuration Files

### `mcp-config.json`
Primary MCP configuration following Claude Desktop standards with:
- **External Research Servers**: Context7, DeepWiki, GitMCP, Semgrep
- **Local Coordination Server**: Claude Code Zen MCP server (port 3000)
- **Tool Mappings**: Organized by workflow type (research, development, coordination)

### `.claude-mcp-config.json`
Alternative configuration format for different MCP clients.

## External MCP Servers

### Context7 (`https://mcp.context7.com/mcp`)
- **Type**: HTTP
- **Purpose**: Research and analysis tools
- **Usage**: Deep code analysis, performance research, system optimization

### DeepWiki (`https://mcp.deepwiki.com/sse`)
- **Type**: Server-Sent Events (SSE)
- **Purpose**: Knowledge base and documentation
- **Usage**: Documentation queries, concept explanations, research

### GitMCP (`https://gitmcp.io/docs`)
- **Type**: HTTP
- **Purpose**: Git operations and repository management
- **Usage**: Repository analysis, branch management, git operations

### Semgrep (`https://mcp.semgrep.ai/sse`)
- **Type**: Server-Sent Events (SSE)  
- **Purpose**: Code analysis and security scanning
- **Usage**: Security analysis, vulnerability detection, code quality

## Local MCP Server

The local Claude Code Zen MCP server provides:
- **Swarm Management**: Coordinate 147+ agent types
- **Performance Monitoring**: Real-time system metrics
- **Memory Management**: Multi-backend memory operations
- **GitHub Integration**: Repository and workflow tools

### Starting the Local Server
```bash
npm run mcp
# or
npx tsx src/interfaces/mcp/start-server.ts --port 3000
```

## GitHub Copilot Optimization

This MCP configuration follows GitHub's recommendations from:
https://github.blog/ai-and-ml/github-copilot/onboarding-your-ai-peer-programmer-setting-up-github-copilot-coding-agent-for-success/

### Key Optimizations:
1. **Comprehensive Context**: Domain-specific instructions and architectural constraints
2. **External Tool Integration**: Research and analysis tools via MCP
3. **Performance Standards**: Sub-100ms coordination, WASM acceleration
4. **Quality Gates**: 85% test coverage, TypeScript strict mode
5. **Clear Boundaries**: Domain-driven architecture with 147+ agent specializations

## Usage Workflow

### Research Tasks
1. Use **Context7** for in-depth analysis and performance research
2. Query **DeepWiki** for documentation and knowledge base searches
3. Coordinate results using local **Claude Code Zen** tools

### Development Tasks
1. Utilize **GitMCP** for repository operations and branch management
2. Apply **Semgrep** for security analysis and code quality checks
3. Manage multi-agent coordination via local MCP server

### Coordination Tasks
1. Use local **Claude Code Zen** MCP server for swarm management
2. Monitor performance and resource utilization
3. Coordinate between different agent types and specializations

## Integration with Copilot

The MCP configuration enhances GitHub Copilot with:
- **External Research Capabilities**: Via Context7 and DeepWiki
- **Enhanced Git Operations**: Through GitMCP integration
- **Security Analysis**: Using Semgrep tools
- **System Coordination**: Local MCP server for claude-code-zen operations

This setup provides Copilot with comprehensive context and tools for optimal code generation and analysis within the claude-code-zen ecosystem.