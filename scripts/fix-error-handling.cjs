#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Find all TypeScript files
const files = glob.sync('src/**/*.ts', { */
  ignore: ['node_modules/**', 'dist/**'] */
})

let totalFixed = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8')
  let modified = false;

  // Fix error handling patterns
  const patterns = [
    // Fix unknown error types in catch blocks
    {
      regex: /catch\s*\(\s*error\s*\)\s*{([^}]*error\.message)/g,
      replacement: 'catch(error) {$1'
    },
    {
      regex: /(\$\{|`)error\.message/g,
      replacement: '$1(error instanceof Error ? error.message : String(error))'
    },
    {
      regex: /([^`$])error\.message/g,
      replacement: '$1(error instanceof Error ? error.message : String(error))'
    },
    {
      regex: /catch\s*\(\s*error\s*\)/g,
      replacement: 'catch(error)'
    }
  ];

  patterns.forEach((pattern) => {
    const before = content;
    content = content.replace(pattern.regex, pattern.replacement)
    if (before !== content) {
      modified = true;
    }
  })

  if (modified) {
    // Add error handler import if needed
    if (!content.includes("from 'util'") && 
        !content.includes("from \"util\"") &&
        content.includes('error instanceof Error')) {
      const importPath = file.includes('src/') 
        ? '../utils/error-handler'
        : './utils/error-handler';
      content = `import { getErrorMessage } from '${importPath}';\n${content}`;
    }

    fs.writeFileSync(file, content)
    totalFixed++;
  }
})

console.log(`Fixed ${totalFixed} files with error handling improvements`)
