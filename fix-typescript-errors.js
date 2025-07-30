#!/usr/bin/env node

/* Comprehensive TypeScript Syntax Error Fixer */
/** Fixes systematic errors introduced during JavaScript to TypeScript conversion */

import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

class TypeScriptErrorFixer {
  constructor() {
    this.filesProcessed = 0;
    this.errorsPatternsFixed = 0;
    this.errors = [];
  }

  async fixAllErrors() {
    console.warn('🔧 Starting comprehensive TypeScript error fixes...');

    // Find all TypeScript files in src directory
    const tsFiles = await glob('src/**/*.ts', {
      cwd: process.cwd(),
      absolute: true,
    });

    console.warn(`📁 Found ${tsFiles.length} TypeScript files to process`);

    for (const filePath of tsFiles) {
      try {
        await this.fixFile(filePath);
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error);
        this.errors.push({ file: filePath, error: error.message });
      }
    }

    this.printSummary();
  }

  async fixFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixedContent = content;
    let localFixes = 0;

    // Fix common TypeScript conversion errors
    const patterns = [
      // Constructor parameter syntax issues
      {
        pattern: /(constructor\s*\([^)]*\))\s*:\s*unknown/g,
        replacement: '$1',
        description: 'constructor type annotations',
      },

      // Function parameter syntax: param = value: type -> param = value
      {
        pattern: /(\w+\s*=\s*[^,)]+):\s*\w+/g,
        replacement: '$1',
        description: 'parameter type annotations',
      },

      // Conditional statements formatting
      {
        pattern: /if\s*\([^)]+\)\s*\n\s*\{/g,
        replacement: (match) => match.replace(/\n\s*/, ' '),
        description: 'conditional statement formatting',
      },

      // Return type annotations in wrong places
      {
        pattern: /return\s+([^;]+):\s*\w+;/g,
        replacement: 'return $1;',
        description: 'return statement type annotations',
      },

      // Template string encoding issues
      {
        pattern: /`([^`]*)\$\{([^}]+)\}([^`]*)`/g,
        replacement: '`$1${$2}$3`',
        description: 'template string formatting',
      },

      // Object syntax issues
      {
        pattern: /(\w+)\s*:\s*true,\s*(\w+):/g,
        replacement: '$1: true,\n  $2:',
        description: 'object property formatting',
      },
    ];

    for (const { pattern, replacement, description } of patterns) {
      const beforeCount = (fixedContent.match(pattern) || []).length;
      if (typeof replacement === 'function') {
        fixedContent = fixedContent.replace(pattern, replacement);
      } else {
        fixedContent = fixedContent.replace(pattern, replacement);
      }
      const afterCount = (fixedContent.match(pattern) || []).length;
      const fixed = beforeCount - afterCount;

      if (fixed > 0) {
        localFixes += fixed;
        console.warn(`  🔧 Fixed ${fixed} ${description} issues`);
      }
    }

    if (localFixes > 0) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      this.filesProcessed++;
      this.errorsPatternsFixed += localFixes;
      console.warn(`✅ Fixed ${localFixes} issues in ${path.relative(process.cwd(), filePath)}`);
    }
  }

  printSummary() {
    console.warn('\n' + '='.repeat(60));
    console.warn('📊 TYPESCRIPT ERROR FIX SUMMARY');
    console.warn('='.repeat(60));
    console.warn(`✅ Files processed: ${this.filesProcessed}`);
    console.warn(`🔧 Error patterns fixed: ${this.errorsPatternsFixed}`);
    console.warn(`❌ Errors encountered: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.warn('\n🚨 ERRORS:');
      this.errors.forEach((error, index) => {
        console.warn(`${index + 1}. ${path.relative(process.cwd(), error.file)}: ${error.error}`);
      });
    }

    console.warn('\n🎉 TypeScript error fixes complete!');
  }
}

// Run the fixer
async function main() {
  const fixer = new TypeScriptErrorFixer();
  await fixer.fixAllErrors();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
