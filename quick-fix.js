#!/usr/bin/env node

/* QUICK FIX - Ultra-fast lint fixes for the most common issues */

import { readFileSync, writeFileSync } from 'node:fs';
import { glob } from 'glob';

console.warn('🔧 QUICK FIX Starting...');

// Get all JS/TS files except node_modules, ruv-FANN, bin
const files = glob.sync('**/*.{js,ts}', {
  ignore: [
    'node_modules/**',
    'ruv-FANN/**/',
    'bin/**',
    'dist/**/',
    'build/**',
    '.git/**/',
  ],
});

let fixedFiles = 0;
let totalFixes = 0;

// Quick fixes for common issues
for (const file of files) {
  try {
    const content = readFileSync(file, 'utf8');
    let fixedContent = content;
    let fileFixes = 0;

    // 1. Fix template literal issues - replace problematic backticks
    const originalBackticks = fixedContent;
    fixedContent = fixedContent.replace(/`[^`]*\$[^}]*$/gm, match => {
      if (!match.includes('}')) {
        return match.replace(/\$.*$/, '');
      }
      return match;
    });
    if (fixedContent !== originalBackticks) fileFixes++;

    // 2. Fix unterminated strings
    const originalStrings = fixedContent;
    fixedContent = fixedContent.replace(/(['"])[^'"]*$/gm, match => {
      if (match.length > 1 && !match.endsWith(match[0])) {
        return match + match[0];
      }
      return match;
    });
    if (fixedContent !== originalStrings) fileFixes++;

    // 3. Fix malformed JSDoc comments
    const originalJSDoc = fixedContent;
    fixedContent = fixedContent.replace(/\/\*\*\s*\*\s*\*\//g, '/**\n */');
    fixedContent = fixedContent.replace(/\*\s*\*\/@/g, '* @');
    if (fixedContent !== originalJSDoc) fileFixes++;

    // 4. Remove orphaned semicolons and quotes
    const originalOrphans = fixedContent;
    fixedContent = fixedContent.replace(/^[\s]*[';]+\s*$/gm, '');
    if (fixedContent !== originalOrphans) fileFixes++;

    // 5. Fix basic syntax issues
    const originalSyntax = fixedContent;
    fixedContent = fixedContent.replace(/\bvar\s+/g, 'const ');
    fixedContent = fixedContent.replace(/(\w+)\s*==\s*([^=])/g, '$1 === $2');
    fixedContent = fixedContent.replace(/(\w+)\s*!=\s*([^=])/g, '$1 !== $2');
    if (fixedContent !== originalSyntax) fileFixes++;

    // 6. Clean up multiple empty lines
    const originalSpacing = fixedContent;
    fixedContent = fixedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    if (fixedContent !== originalSpacing) fileFixes++;

    if (fileFixes > 0) {
      writeFileSync(file, fixedContent);
      fixedFiles++;
      totalFixes += fileFixes;
      console.warn(`✅ Fixed ${file} (${fileFixes} fixes)`);
    }
  } catch (error) {
    console.warn(`❌ Error processing ${file}: ${error.message}`);
  }
}

console.warn(`\n🎉 Quick fix complete!`);
console.warn(`📁 Files processed: ${files.length}`);
console.warn(`✅ Files fixed: ${fixedFiles}`);
console.warn(`🔧 Total fixes applied: ${totalFixes}`);
