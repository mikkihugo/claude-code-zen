# Claude Desktop MCP Configuration Guide

This guide explains how to configure Claude Desktop to use the claude-code-zen MCP servers for enhanced development workflow.

## Quick Setup

1. **Locate Claude Desktop configuration file:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add the following configuration:**

```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp"
    },
    "deepwiki": {
      "type": "sse", 
      "url": "https://mcp.deepwiki.com/sse"
    },
    "gitmcp": {
      "type": "http",
      "url": "https://gitmcp.io/mcp"
    },
    "semgrep": {
      "type": "sse",
      "url": "https://mcp.semgrep.ai/sse"
    },
    "claude-code-zen": {
      "command": "npx",
      "args": ["tsx", "src/interfaces/mcp/start-server.ts", "--port", "3000"],
      "cwd": "/absolute/path/to/claude-code-zen"
    }
  }
}
```

3. **Update the `cwd` path** to your actual claude-code-zen directory location.

4. **Restart Claude Desktop** to load the new configuration.

## Verification

1. **Start the local MCP server:**
   ```bash
   cd /path/to/claude-code-zen
   npm run mcp
   ```

2. **Verify server is running:**
   ```bash
   node scripts/validate-mcp-config.js
   ```

3. **In Claude Desktop**, you should see MCP tools available for:
   - **Research**: Context7 and DeepWiki tools
   - **Development**: GitMCP and Semgrep tools  
   - **Coordination**: Claude Code Zen system tools

## Available Tools

### Context7 (Research & Analysis)
- Code analysis and performance research
- System optimization recommendations
- Deep technical analysis

### DeepWiki (Knowledge Base)
- Documentation queries
- Concept explanations
- Research assistance

### GitMCP (Repository Management)
- Git operations and repository analysis
- Branch management
- Version control tools

### Semgrep (Code Quality)
- Security analysis
- Vulnerability detection
- Code quality checks

### Claude Code Zen (Local Coordination)
- Swarm management (147+ agent types)
- Performance monitoring
- Memory management
- GitHub integration

## Troubleshooting

### Local Server Issues
- Ensure Node.js 20+ is installed
- Check that port 3000 is available
- Verify the `cwd` path is correct

### External Server Issues
- Check internet connectivity
- Some servers may require authentication
- Server availability may vary

### Claude Desktop Issues
- Restart Claude Desktop after configuration changes
- Check Claude Desktop logs for errors
- Ensure JSON configuration is valid

## GitHub Copilot Integration

This MCP setup enhances GitHub Copilot with:
- External research capabilities
- Enhanced code analysis tools
- System coordination features
- Optimal development workflow

Following GitHub's recommendations from:
https://github.blog/ai-and-ml/github-copilot/onboarding-your-ai-peer-programmer-setting-up-github-copilot-coding-agent-for-success/