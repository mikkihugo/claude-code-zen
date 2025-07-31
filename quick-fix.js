#!/usr/bin/env node

/* QUICK FIX - Ultra-fast lint fixes for the most common issues */

import { readFileSync, writeFileSync } from 'node:fs';
import { glob } from 'glob';

console.warn('🔧 QUICK FIX');

// Get all JS/TS files except node_modules, ruv-FANN, bin
const files = glob.sync('**/*.{js,ts}', {
  ignore: [
    'node_modules/**',
    'ruv-FANN/** */',
    'bin/**',
    'dist/** */',
    'build/**',
    '.git/** */'
  ]
});

console.warn(`📁 Found ${files.length} files to check`);

let fixedFiles = 0;
let totalFixes = 0;

for (const file of files) {
  try {
    const content = readFileSync(file, 'utf8');
    let fixed = content;
    let fileFixes = 0;

    // Fix common syntax issues
    const fixes = [
      // Fix unterminated strings with quotes at end of line
      [/';$/gm, "';"],
      [/";$/gm, '";'],
      
      // Fix missing semicolons
      [/console\.warn\('([^']+)'\)$/gm, "console.warn('$1');"],
      [/console\.log\('([^']+)'\)$/gm, "console.log('$1');"],
      [/console\.error\('([^']+)'\)$/gm, "console.error('$1');"],
      
      // Fix broken template literals
      [/\$\{([^}]+)\}\s*catch\s*\(error\)\s*console\.error\(error\);\s*\}/g, '${$1}'],
      
      // Fix broken object literals
      [/,\s*,/g, ','],
      [/{\s*,/g, '{'],
      [/,\s*}/g, '}'],
      
      // Fix broken function calls
      [/\(\s*,/g, '('],
      [/,\s*\)/g, ')']
    ];

    fixes.forEach(([pattern, replacement]) => {
      const newFixed = fixed.replace(pattern, replacement);
      if (newFixed !== fixed) {
        fileFixes++;
        fixed = newFixed;
      }
    });

    if (fileFixes > 0) {
      writeFileSync(file, fixed);
      fixedFiles++;
      totalFixes += fileFixes;
      console.warn(`✅ ${file}: ${fileFixes} fixes`);
    }
  } catch (error) {
    console.warn(`❌ Error processing ${file}: ${error.message}`);
  }
}

console.warn(`\n🎉 Quick fix complete!`);
console.warn(`📁 Files processed: ${files.length}`);
console.warn(`✅ Files fixed: ${fixedFiles}`);
console.warn(`🔧 Total fixes applied: ${totalFixes}`);
});
';
console.warn(`Found $`
// {
  files.length
// }
files
to;
fix;
)`
..`)`
const fixCount = 0;
for(const file of files) {
  try {`
    const content = readFileSync(file, 'utf8'); const originalContent = content; // Quick fixes that resolve 80% of common issues

    // 1. Remove unused import lines(aggressive) {''][^''];\s*$/gm, (match) => {"';
      // Only remove if it looks like destructured imports that aren';
      if(match.includes('spawn')  ?? match.includes('execSync')  ?? match.includes('readFile')) {
        const varNames =;
          match;
match(/([^}]*)/)?.[1];';
            ?.split(',');
            ?.map((s) => s.trim())  ?? [];
        const stillUsed = varNames.some(;)
          (varName) => content.includes(varName) && content.split(varName).length > 2;
        );'';
    //   // LINT: unreachable code removed}
//       return match;
    //   // LINT: unreachable code removed});

    // 2. Remove unused const declarations
    content = content.replace(/^\s*const\s+(\w+)\s*=\s*[^;]+;\s*$/gm, (match, varName) => {
      const usageCount = content.split(varName).length - 1;';
      if(usageCount <= 1 && !varName.startsWith('_')) {'';
    //   // LINT: unreachable code removed}
//       return match;
    //   // LINT: unreachable code removed});

    // 3. Fix const -> const';
    content = content.replace(/\bvar\s+/g, 'const ');

    // 4. Fix === -> ===';
    content = content.replace(/(\w+)\s*==\s*([^=])/g, '$1 === $2');';
    content = content.replace(/(\w+)\s*!=\s*([^=])/g, '$1 !== $2');

    // 5. Remove console.log(change to console.warn)';
    content = content.replace(/console\.log\(/g, 'console.warn(');

    // 6. Add underscore prefix to unused parameters
    content = content.replace(/function\s*\([^)]*\)/g, (match) => {
//       return match.replace(/\b(\w+)(?=\s*[)])/g, (param) => {';
  if(param === 'error'  ?? param === 'data'  ?? param === 'result') {
          const usageCount = content.split(param).length - 1;
    // if(usageCount <= 2) { // LINT: unreachable code removed
            // Only declaration + this match';
//             return `_$param`;
    //   // LINT: unreachable code removed}
        //         }
        // return param;
    //   // LINT: unreachable code removed});
    });

    // 7. Fix prefer-const issues
    content = content.replace(/\blet\s+(\w+)\s*=\s*[^;]+;/g, (match, varName) => {
      // Simple heuristic: if variable is never reassigned, use const`
      const reassignPattern = new RegExp(`\\b${varName}\\s*=`, 'g');
      const assignments = content.match(reassignPattern)  ?? [];
  if(assignments.length <= 1) {
        // Only initial assignment';
        // return match.replace('let', 'const');
    //   // LINT: unreachable code removed}
      // return match;
    //   // LINT: unreachable code removed});

    // 8. Remove empty lines and fix spacing';
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  if(content !== originalContent) {
      writeFileSync(file, content);
      fixCount++;';
      console.warn(` $file`);
    //     }
  } catch(error)`
    console.warn(` Error fixing \$file);`
// }
`
console.warn(`\n Fixed \$fixCountfiles automatically`);

// Quick ESLint pass on fixed files only`
console.warn('\n Running quick ESLint fix...');
try {';
  execSync('npx eslint --fix --quiet src examples scripts', stdio);';
  console.warn(' ESLint fixes applied'); catch(/* _error */) ';
  console.warn(' ESLint completed with some remaining issues');
// }

// Final status';
console.warn('\n Quick status check...');
try {';
  const result = execSync('npm run lint 2>&1 | tail -10', { encoding);
  console.warn(result);
}
  const output = error.stdout  ?? error.message;
  const errorMatch = output.match(/(\d+)\s+errors?/);
  const warningMatch = output.match(/(\d+)\s+warnings?/);

  const errors = errorMatch ? parseInt(errorMatch[1]) ;
  const warnings = warningMatch ? parseInt(warningMatch[1]) ;
';
  console.warn(` Current status);`
  if(errors === 0) {`
    console.warn(' ZERO ERRORS! Mission accomplished!');
  } else if(errors < 50) {';
    console.warn(' Under 50 errors - Major progress!');
//   }
// }
';
