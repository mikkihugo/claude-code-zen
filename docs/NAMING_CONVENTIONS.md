# Naming Convention Standards

This document outlines the naming conventions for the claude-code-zen project, following Google TypeScript Style Guide standards.

## 🎯 Overview

The project enforces consistent naming patterns using automated tooling:
- **Files & Directories**: `kebab-case`
- **TypeScript Identifiers**: Google Style Guide patterns
- **Automated Validation**: CI/CD integrated checks
- **Safe Refactoring**: Automated renaming with import updates

## 📋 File System Naming

### Files (kebab-case)
```typescript
// ✅ Correct examples
swarm-coordination.ts
load-balancing-engine.ts
neural-network-trainer.ts
fact-knowledge-gatherer.ts

// ❌ Incorrect examples  
SwarmCoordination.ts        // PascalCase
loadBalancingEngine.ts      // camelCase
neural_network_trainer.ts   // snake_case
```

### Directories (kebab-case)
```
// ✅ Correct structure
src/
├── coordination/
├── load-balancing/
├── neural-networks/
├── swarm-intelligence/
└── fact-integration/

// ❌ Incorrect examples
├── swarmCoordination/      // camelCase
├── LoadBalancing/          // PascalCase
├── neural_networks/        // snake_case
```

## 🏷️ TypeScript Naming Conventions

### Interfaces (PascalCase)
```typescript
// ✅ Correct
interface SwarmCoordinator {
  coordinateAgents(): Promise<void>;
}

interface LoadBalancingEngine {
  balanceWorkload(): Promise<void>;
  readonly engineName: string;
}

interface NeuralNetworkTrainer {
  trainModel(data: TrainingData): Promise<ModelResult>;
}
```

### Classes (PascalCase)
```typescript
// ✅ Correct
class SwarmManager {
  private readonly agents: Agent[];
  
  public async coordinateSwarm(): Promise<void> {
    // Implementation
  }
}

class LoadBalancingController {
  private strategy: BalancingStrategy;
  
  public selectOptimalAgent(): Agent {
    // Implementation
  }
}
```

### Functions & Methods (camelCase)
```typescript
// ✅ Correct
function coordinateSwarm(): void {}
async function balanceWorkload(): Promise<void> {}
function processNeuralData(): DataResult {}

class MyClass {
  public calculateMetrics(): Metrics {}
  private validateInput(): boolean {}
}
```

### Variables (camelCase)
```typescript
// ✅ Correct
const swarmManager = new SwarmManager();
let currentStrategy = 'round-robin';
const agentPool = [];
const neuralModelConfig = { layers: 3 };
```

### Constants (SCREAMING_SNAKE_CASE)
```typescript
// ✅ Correct
const MAX_AGENTS = 1000;
const DEFAULT_TIMEOUT = 30000;
const LOAD_BALANCING_CONFIG = {
  algorithm: 'round-robin',
  maxRetries: 3
} as const;

const NEURAL_NETWORK_PRESETS = {
  SIMPLE: { layers: [10, 5, 1] },
  COMPLEX: { layers: [100, 50, 25, 1] }
} as const;
```

### Types (PascalCase)
```typescript
// ✅ Correct
type CoordinationStrategy = 'mesh' | 'hierarchical' | 'ring';
type LoadBalancingAlgorithm = 'round-robin' | 'least-connections' | 'weighted';
type NeuralActivation = 'relu' | 'sigmoid' | 'tanh';

// Union types with kebab-case string literals
type EventType = 'swarm-started' | 'agent-connected' | 'task-completed';
type ConfigKey = 'load-balancing-strategy' | 'neural-network-config';
```

### String Literals (kebab-case)
```typescript
// ✅ Correct for identifiers/strategies
type Strategy = 'round-robin' | 'least-connections' | 'weighted-round-robin';
const eventType = 'swarm-coordination-started';
const configKey = 'load-balancing-strategy';

// Configuration objects
const CONFIG = {
  'neural-network-type': 'feed-forward',
  'optimization-algorithm': 'adam',
  'activation-function': 'relu'
};
```

## 🔧 Automated Tooling

### CLI Commands
```bash
# Analyze naming convention violations
npm run naming:analyze [directory]

# Validate naming conventions with detailed report
npm run naming:validate [directory]

# Generate rename script (dry-run mode)
npm run naming:fix [directory] --dry-run

# Quick validation for CI/CD
npm run naming:quick [directory]

# Interactive demo
npm run naming:demo
```

### Example Usage
```bash
# Analyze the entire src directory
npm run naming:analyze src/

# Validate specific component
npm run naming:validate src/coordination/

# Quick check for CI (exits with code 1 if issues found)
npm run naming:quick src/
```

### Tool Features
- **Safe Renaming**: Creates backups before changes
- **Import Updates**: Automatically updates import/export paths
- **TypeScript Validation**: Ensures code still compiles after changes
- **Rollback Support**: Automatic rollback on validation failure
- **Compliance Reporting**: Detailed metrics and recommendations

## 📊 Compliance Metrics

### Success Criteria
- **100% kebab-case compliance** for files and directories
- **100% TypeScript naming compliance** per Google Style Guide
- **Zero broken imports** after automated refactoring
- **All tests pass** after naming standardization
- **TypeScript compilation success** after changes

### Current Status
```
Overall Compliance: 98%
Files Analyzed: 275
Critical Issues: 6
Recommendations: Available
```

### Issue Categories
1. **File Naming**: Convert to kebab-case
2. **Directory Naming**: Convert to kebab-case  
3. **Identifier Naming**: Follow TypeScript conventions
4. **Import Paths**: Update after file renames

## 🚀 CI/CD Integration

### GitHub Actions
```yaml
- name: Validate Naming Conventions
  run: |
    npm ci
    npm run naming:quick src/
  
# Exit with error if naming violations found
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run naming:quick src/"
    }
  }
}
```

### IDE Integration
Most IDEs will automatically follow these conventions when configured with:
- ESLint rules for naming conventions
- Prettier for consistent formatting
- TypeScript strict mode enabled

## 🛠️ Manual Validation

### Quick Checklist
- [ ] All file names use kebab-case
- [ ] All directory names use kebab-case  
- [ ] All interfaces use PascalCase
- [ ] All classes use PascalCase
- [ ] All functions/methods use camelCase
- [ ] All variables use camelCase
- [ ] All constants use SCREAMING_SNAKE_CASE
- [ ] All types use PascalCase
- [ ] String literals use kebab-case for identifiers

### Common Patterns to Avoid
```typescript
// ❌ Mixed naming conventions
interface loadBalancer {}           // Should be LoadBalancer
class neural_network {}             // Should be NeuralNetwork
function CalculateMetrics() {}      // Should be calculateMetrics
const max_agents = 100;             // Should be MAX_AGENTS
type coordination_strategy = '';    // Should be CoordinationStrategy
```

## 📚 References

- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [TypeScript Handbook - Naming Conventions](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [ESLint Naming Convention Rules](https://typescript-eslint.io/rules/naming-convention/)

## 🔄 Migration Guide

### For Existing Files
1. Use `npm run naming:analyze` to identify issues
2. Review suggested changes with `npm run naming:fix --dry-run`
3. Apply changes carefully, testing after each batch
4. Verify with `npm run naming:validate`

### For New Development
- Configure your IDE to follow these conventions
- Use the naming validation in your workflow
- Reference the examples in this document
- Run quick validation before committing changes

---

**Enforcement**: These conventions are enforced by automated tooling and CI/CD integration. All new code should follow these standards, and existing code should be gradually updated to comply.