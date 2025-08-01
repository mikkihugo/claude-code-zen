/**
 * Remote wrapper generation module
 * Creates cross-platform wrapper scripts for remote execution
 */

import { promises as fs } from 'fs';
import path from 'path';

class RemoteWrapperGenerator {
  constructor(options = {}) {
    this.workingDir = options.workingDir || process.cwd();
    this.packageName = options.packageName || 'ruv-swarm';
  }

  /**
   * Generate bash wrapper script for Unix-like systems
   */
  generateBashWrapper() {
    return `#!/usr/bin/env bash
# ${this.packageName} local wrapper
# This script ensures ${this.packageName} runs from your project directory

# Save the current directory
PROJECT_DIR="\${PWD}"

# Set environment to ensure correct working directory
export PWD="\${PROJECT_DIR}"
export RUVSW_WORKING_DIR="\${PROJECT_DIR}"

# Function to find and execute ${this.packageName}
find_and_execute() {
    # 1. Try local npm/npx
    if command -v npx &> /dev/null; then
        cd "\${PROJECT_DIR}"
        exec npx ${this.packageName} "\$@"
        
    # 2. Try local node_modules
    elif [ -f "\${PROJECT_DIR}/node_modules/.bin/${this.packageName}" ]; then
        cd "\${PROJECT_DIR}"
        exec "\${PROJECT_DIR}/node_modules/.bin/${this.packageName}" "\$@"
        
    # 3. Try global installation
    elif command -v ${this.packageName} &> /dev/null; then
        cd "\${PROJECT_DIR}"
        exec ${this.packageName} "\$@"
        
    # 4. Fallback to latest version
    else
        cd "\${PROJECT_DIR}"
        exec npx ${this.packageName}@latest "\$@"
    fi
}

# Handle remote execution if SSH context detected
if [ -n "\$SSH_CLIENT" ] || [ -n "\$SSH_TTY" ] || [ "\$TERM" = "screen" ]; then
    echo "🌐 Remote execution detected"
    export RUVSW_REMOTE_MODE=1
fi

# Execute with error handling
find_and_execute "\$@"
`;
  }

  /**
   * Generate Windows batch wrapper script
   */
  generateBatchWrapper() {
    return `@echo off
REM ${this.packageName} local wrapper (Windows)
REM This script ensures ${this.packageName} runs from your project directory

set PROJECT_DIR=%CD%
set RUVSW_WORKING_DIR=%PROJECT_DIR%

REM Check for remote execution (basic detection)
if defined SSH_CLIENT set RUVSW_REMOTE_MODE=1
if defined SSH_TTY set RUVSW_REMOTE_MODE=1

REM Function to find and execute ${this.packageName}
call :find_and_execute %*
goto :eof

:find_and_execute
    REM 1. Try npx
    where npx >nul 2>nul
    if %ERRORLEVEL% == 0 (
        cd /d "%PROJECT_DIR%"
        npx ${this.packageName} %*
        exit /b %ERRORLEVEL%
    )
    
    REM 2. Try local node_modules
    if exist "%PROJECT_DIR%\\node_modules\\.bin\\${this.packageName}.cmd" (
        cd /d "%PROJECT_DIR%"
        "%PROJECT_DIR%\\node_modules\\.bin\\${this.packageName}.cmd" %*
        exit /b %ERRORLEVEL%
    )
    
    REM 3. Try global installation
    where ${this.packageName} >nul 2>nul
    if %ERRORLEVEL% == 0 (
        cd /d "%PROJECT_DIR%"
        ${this.packageName} %*
        exit /b %ERRORLEVEL%
    )
    
    REM 4. Fallback to latest
    cd /d "%PROJECT_DIR%"
    npx ${this.packageName}@latest %*
    exit /b %ERRORLEVEL%
`;
  }

  /**
   * Generate PowerShell wrapper script
   */
  generatePowerShellWrapper() {
    return `#!/usr/bin/env pwsh
# ${this.packageName} local wrapper (PowerShell)
# Cross-platform PowerShell script for ${this.packageName}

param([Parameter(ValueFromRemainingArguments)][string[]]$Arguments)

# Save the current directory
$ProjectDir = Get-Location
$env:PWD = $ProjectDir
$env:RUVSW_WORKING_DIR = $ProjectDir

# Detect remote execution
if ($env:SSH_CLIENT -or $env:SSH_TTY -or $env:TERM -eq "screen") {
    Write-Host "🌐 Remote execution detected"
    $env:RUVSW_REMOTE_MODE = "1"
}

# Function to find and execute ${this.packageName}
function Find-And-Execute {
    param([string[]]$Args)
    
    try {
        # 1. Try npx
        if (Get-Command npx -ErrorAction SilentlyContinue) {
            Set-Location $ProjectDir
            & npx ${this.packageName} @Args
            return
        }
        
        # 2. Try local node_modules
        $localBin = Join-Path $ProjectDir "node_modules" ".bin" "${this.packageName}"
        if (Test-Path $localBin) {
            Set-Location $ProjectDir
            & $localBin @Args
            return
        }
        
        # 3. Try global installation
        if (Get-Command ${this.packageName} -ErrorAction SilentlyContinue) {
            Set-Location $ProjectDir
            & ${this.packageName} @Args
            return
        }
        
        # 4. Fallback to latest
        Set-Location $ProjectDir
        & npx ${this.packageName}@latest @Args
        
    } catch {
        Write-Error "Failed to execute ${this.packageName}: $_"
        exit 1
    }
}

# Execute with arguments
Find-And-Execute $Arguments
`;
  }

  /**
   * Generate Claude helper scripts
   */
  generateClaudeHelpers() {
    const bashHelper = `#!/usr/bin/env bash
# Claude Code Direct Swarm Invocation Helper
# Generated by ${this.packageName} --claude setup

# Colors for output
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
RED='\\033[0;31m'
NC='\\033[0m'

echo -e "\${GREEN}🐝 ${this.packageName} Claude Code Direct Invocation\${NC}"
echo "============================================="
echo

# Function to invoke Claude with swarm commands
invoke_claude_swarm() {
    local prompt="\$1"
    local skip_permissions="\$2"
    
    echo -e "\${YELLOW}🚀 Invoking Claude Code with swarm integration...\${NC}"
    echo "Prompt: \$prompt"
    echo
    
    if [ "\$skip_permissions" = "true" ]; then
        echo -e "\${RED}⚠️  Using --dangerously-skip-permissions flag\${NC}"
        claude "\$prompt" --dangerously-skip-permissions
    else
        claude "\$prompt"
    fi
}

# Predefined swarm prompts with remote support
case "\$1" in
    "research")
        invoke_claude_swarm "Initialize a research swarm with 5 agents using ${this.packageName}. Create researcher, analyst, and coder agents. Then orchestrate the task: \$2" "\$3"
        ;;
    "development")
        invoke_claude_swarm "Initialize a development swarm with 8 agents using ${this.packageName} in hierarchical topology. Create architect, frontend coder, backend coder, and tester agents. Then orchestrate the task: \$2" "\$3"
        ;;
    "analysis")
        invoke_claude_swarm "Initialize an analysis swarm with 6 agents using ${this.packageName}. Create multiple analyst agents with different specializations. Then orchestrate the task: \$2" "\$3"
        ;;
    "optimization")
        invoke_claude_swarm "Initialize an optimization swarm with 4 agents using ${this.packageName}. Create optimizer and analyst agents. Then orchestrate the performance optimization task: \$2" "\$3"
        ;;
    "custom")
        invoke_claude_swarm "\$2" "\$3"
        ;;
    "help")
        echo -e "\${GREEN}Usage:\${NC}"
        echo "  ./claude-swarm.sh research \\"task description\\" [skip-permissions]"
        echo "  ./claude-swarm.sh development \\"task description\\" [skip-permissions]"
        echo "  ./claude-swarm.sh analysis \\"task description\\" [skip-permissions]"
        echo "  ./claude-swarm.sh optimization \\"task description\\" [skip-permissions]"
        echo "  ./claude-swarm.sh custom \\"full claude prompt\\" [skip-permissions]"
        echo
        echo -e "\${GREEN}Examples:\${NC}"
        echo '  ./claude-swarm.sh research "Analyze modern web frameworks" true'
        echo '  ./claude-swarm.sh development "Build user authentication API"'
        echo '  ./claude-swarm.sh custom "Initialize ${this.packageName} and create 3 agents for data processing"'
        echo
        echo -e "\${YELLOW}Note:\${NC} Add 'true' as the last parameter to use --dangerously-skip-permissions"
        ;;
    *)
        echo -e "\${RED}Unknown command: \$1\${NC}"
        echo "Run './claude-swarm.sh help' for usage information"
        exit 1
        ;;
esac`;

    const batchHelper = `@echo off
REM Claude Code Direct Swarm Invocation Helper (Windows)
REM Generated by ${this.packageName} --claude setup

echo 🐝 ${this.packageName} Claude Code Direct Invocation
echo ============================================
echo.

if "%1"=="research" (
    echo 🚀 Invoking Claude Code with research swarm...
    if "%3"=="true" (
        claude "Initialize a research swarm with 5 agents using ${this.packageName}. Create researcher, analyst, and coder agents. Then orchestrate the task: %2" --dangerously-skip-permissions
    ) else (
        claude "Initialize a research swarm with 5 agents using ${this.packageName}. Create researcher, analyst, and coder agents. Then orchestrate the task: %2"
    )
) else if "%1"=="development" (
    echo 🚀 Invoking Claude Code with development swarm...
    if "%3"=="true" (
        claude "Initialize a development swarm with 8 agents using ${this.packageName} in hierarchical topology. Create architect, frontend coder, backend coder, and tester agents. Then orchestrate the task: %2" --dangerously-skip-permissions
    ) else (
        claude "Initialize a development swarm with 8 agents using ${this.packageName} in hierarchical topology. Create architect, frontend coder, backend coder, and tester agents. Then orchestrate the task: %2"
    )
) else if "%1"=="custom" (
    echo 🚀 Invoking Claude Code with custom prompt...
    if "%3"=="true" (
        claude "%2" --dangerously-skip-permissions
    ) else (
        claude "%2"
    )
) else if "%1"=="help" (
    echo Usage:
    echo   claude-swarm.bat research "task description" [skip-permissions]
    echo   claude-swarm.bat development "task description" [skip-permissions]
    echo   claude-swarm.bat custom "full claude prompt" [skip-permissions]
    echo.
    echo Examples:
    echo   claude-swarm.bat research "Analyze modern web frameworks" true
    echo   claude-swarm.bat development "Build user authentication API"
    echo.
    echo Note: Add 'true' as the last parameter to use --dangerously-skip-permissions
) else (
    echo Unknown command: %1
    echo Run 'claude-swarm.bat help' for usage information
    exit /b 1
)`;

    return { bash: bashHelper, batch: batchHelper };
  }

  /**
   * Create all wrapper scripts
   */
  async createWrappers() {
    console.log('🔧 Creating remote wrapper scripts...');

    try {
      const scripts = [
        {
          name: `${this.packageName}-wrapper`,
          content: this.generateBashWrapper(),
          mode: 0o755,
        },
        {
          name: `${this.packageName}-wrapper.bat`,
          content: this.generateBatchWrapper(),
          mode: 0o644,
        },
        {
          name: `${this.packageName}-wrapper.ps1`,
          content: this.generatePowerShellWrapper(),
          mode: 0o755,
        },
      ];

      const createdFiles = [];

      for (const script of scripts) {
        const filePath = path.join(this.workingDir, script.name);
        await fs.writeFile(filePath, script.content, { mode: script.mode });
        createdFiles.push(script.name);
      }

      console.log(`✅ Created wrapper scripts: ${createdFiles.join(', ')}`);
      return { files: createdFiles, success: true };
    } catch (error) {
      console.error('❌ Failed to create wrapper scripts:', error.message);
      throw error;
    }
  }

  /**
   * Create Claude helper scripts
   */
  async createClaudeHelpers() {
    console.log('🤖 Creating Claude helper scripts...');

    try {
      const helpers = this.generateClaudeHelpers();

      const scripts = [
        {
          name: 'claude-swarm.sh',
          content: helpers.bash,
          mode: 0o755,
        },
        {
          name: 'claude-swarm.bat',
          content: helpers.batch,
          mode: 0o644,
        },
      ];

      const createdFiles = [];

      for (const script of scripts) {
        const filePath = path.join(this.workingDir, script.name);
        await fs.writeFile(filePath, script.content, { mode: script.mode });
        createdFiles.push(script.name);
      }

      console.log(`✅ Created Claude helper scripts: ${createdFiles.join(', ')}`);
      return { files: createdFiles, success: true };
    } catch (error) {
      console.error('❌ Failed to create Claude helper scripts:', error.message);
      throw error;
    }
  }

  /**
   * Create all remote scripts
   */
  async createAll() {
    console.log('🌐 Setting up remote execution capabilities...');

    try {
      const results = {
        wrappers: await this.createWrappers(),
        helpers: await this.createClaudeHelpers(),
        success: true,
      };

      console.log('✅ Remote execution setup complete');
      console.log('   - Cross-platform wrapper scripts');
      console.log('   - Claude integration helpers');
      console.log('   - Remote execution detection');

      return results;
    } catch (error) {
      console.error('❌ Failed to setup remote execution:', error.message);
      throw error;
    }
  }
}

export { RemoteWrapperGenerator };
