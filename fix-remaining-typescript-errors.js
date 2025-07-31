#!/usr/bin/env node

/* Fix Remaining TypeScript Syntax Errors */
/** Handles additional patterns missed by the first fix */

import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

class RemainingTypeScriptErrorFixer {
  constructor() {
    this.filesProcessed = 0;
    this.errorsPatternsFixed = 0;
    this.errors = [];
  }

  async fixAllErrors() {
    console.warn('🔧 Starting remaining TypeScript error fixes...');

    // Find all TypeScript files in src directory
    const tsFiles = await glob('src/**/*. */ts', {
      cwd: process.cwd(),
      absolute: true});

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

    // Fix patterns that were missed in the first pass
    const patterns = [
      // Object property syntax: stats = { property; } -> stats = { property }
      {
        pattern: /(\w+)\s*=\s*\{\s*(\w+);\s*\}/g,
        replacement: '$1 = { $2 }',
        description: 'object property syntax'},

      // Type annotation issues: property = default -> property = value
      {
        pattern: /(\w+)\s*=\s*default\b/g,
        replacement: '$1 = undefined',
        description: 'default value assignments'},

      // Object key assignments: key = {} -> key = { value }
      {
        pattern: /(\w+)\s*=\s*\{\s*\}/g,
        replacement: '$1 = {}',
        description: 'empty object assignments'},

      // Arrow function syntax issues
      {
        pattern: /=>\s*\{\s*;\s*\}/g,
        replacement: '=> {}',
        description: 'empty arrow functions'},

      // Variable declarations with semicolons
      {
        pattern: /const\s+(\w+)\s*;\s*=/g,
        replacement: 'const $1 =',
        description: 'variable declarations'},
    ];

    for (const { pattern, replacement, description } of patterns) {
      const beforeCount = (fixedContent.match(pattern) || []).length;
      fixedContent = fixedContent.replace(pattern, replacement);
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
    console.warn('📊 REMAINING TYPESCRIPT ERROR FIX SUMMARY');
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

    console.warn('\n🎉 Remaining TypeScript error fixes complete!');
  }
}

// Run the fixer
async function main() {
  const fixer = new RemainingTypeScriptErrorFixer();
  await fixer.fixAllErrors();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
