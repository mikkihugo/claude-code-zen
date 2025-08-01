#!/usr/bin/env node
/**
 * Document Validation Script
 * Validates document structure, versioning, and cross-references
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const yaml = require('js-yaml');

class DocumentValidator {
  constructor(docsDir = 'docs') {
    this.docsDir = docsDir;
    this.errors = [];
    this.warnings = [];

    // Document type patterns
    this.documentTypes = {
      vision: /^01-vision\/.*\.md$/,
      adr: /^02-adrs\/.*\.md$/,
      prd: /^03-prds\/.*\.md$/,
      epic: /^04-epics\/.*\.md$/,
      feature: /^05-features\/.*\.md$/,
      task: /^06-tasks\/.*\.md$/,
      spec: /^07-specs\/.*\.md$/,
    };

    // Required header fields by document type
    this.requiredFields = {
      vision: ['Document Type', 'Created', 'Last Updated', 'Status'],
      adr: ['Document Type', 'Created', 'Last Updated', 'Status', 'Deciders'],
      prd: ['Document Type', 'Created', 'Last Updated', 'Status', 'Product Manager'],
      epic: ['Document Type', 'Created', 'Last Updated', 'Status', 'Epic Lead'],
      feature: ['Document Type', 'Created', 'Last Updated', 'Status', 'Feature Owner'],
      task: ['Document Type', 'Created', 'Last Updated', 'Status', 'Assignee'],
      spec: ['Document Type', 'Created', 'Last Updated', 'Status', 'Technical Lead'],
    };
  }

  /**
   * Main validation function
   */
  async validate() {
    console.log('🔍 Starting document validation...');

    try {
      const docFiles = await this.findDocumentFiles();
      console.log(`📄 Found ${docFiles.length} documents to validate`);

      for (const file of docFiles) {
        await this.validateDocument(file);
      }

      await this.validateCrossReferences(docFiles);
      await this.validateVersionConsistency(docFiles);

      this.reportResults();

      // Exit with error code if there are errors
      return this.errors.length === 0;
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return false;
    }
  }

  /**
   * Find all document files
   */
  async findDocumentFiles() {
    const pattern = path.join(this.docsDir, '**/*.md');
    const files = glob.sync(pattern);

    // Filter out README files and templates
    return files.filter((file) => {
      const relativePath = path.relative(this.docsDir, file);
      return (
        !relativePath.includes('README.md') &&
        !relativePath.includes('templates/') &&
        !relativePath.includes('VERSIONING.md')
      );
    });
  }

  /**
   * Validate individual document
   */
  async validateDocument(filePath) {
    const relativePath = path.relative(this.docsDir, filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    // Determine document type from path
    const docType = this.getDocumentType(relativePath);
    if (!docType) {
      this.warnings.push(`${relativePath}: Could not determine document type from path`);
      return;
    }

    // Validate document structure
    this.validateDocumentStructure(relativePath, content, docType);

    // Validate metadata header
    this.validateMetadataHeader(relativePath, content, docType);

    // Validate version format
    this.validateVersionFormat(relativePath, content);

    // Validate document type specific requirements
    this.validateTypeSpecificRequirements(relativePath, content, docType);
  }

  /**
   * Get document type from file path
   */
  getDocumentType(relativePath) {
    for (const [type, pattern] of Object.entries(this.documentTypes)) {
      if (pattern.test(relativePath)) {
        return type;
      }
    }
    return null;
  }

  /**
   * Validate document structure
   */
  validateDocumentStructure(filePath, content, docType) {
    const lines = content.split('\n');

    // Check for title (first non-empty line should be h1)
    const firstNonEmpty = lines.find((line) => line.trim());
    if (!firstNonEmpty || !firstNonEmpty.startsWith('# ')) {
      this.errors.push(`${filePath}: Document must start with h1 title`);
    }

    // Check for metadata block after title
    const titleIndex = lines.findIndex((line) => line.startsWith('# '));
    if (titleIndex >= 0) {
      const metadataStart = titleIndex + 2; // Skip title and empty line
      if (metadataStart >= lines.length || !lines[metadataStart].startsWith('**Document Type**:')) {
        this.errors.push(`${filePath}: Missing metadata block after title`);
      }
    }
  }

  /**
   * Validate metadata header
   */
  validateMetadataHeader(filePath, content, docType) {
    const metadataSection = this.extractMetadataSection(content);
    if (!metadataSection) {
      this.errors.push(`${filePath}: No metadata section found`);
      return;
    }

    const requiredFields = this.requiredFields[docType] || this.requiredFields.task; // default

    for (const field of requiredFields) {
      const fieldPattern = new RegExp(`\\*\\*${field}\\*\\*:\\s*(.+)`);
      const match = metadataSection.match(fieldPattern);

      if (!match) {
        this.errors.push(`${filePath}: Missing required field '${field}'`);
      } else if (match[1].trim() === '[Name]' || match[1].trim() === '[Date]') {
        this.warnings.push(`${filePath}: Field '${field}' contains template placeholder`);
      }
    }

    // Validate status field values
    const statusMatch = metadataSection.match(/\*\*Status\*\*:\s*(.+)/);
    if (statusMatch) {
      const status = statusMatch[1].trim();
      const validStatuses = this.getValidStatuses(docType);
      if (!validStatuses.includes(status)) {
        this.errors.push(
          `${filePath}: Invalid status '${status}'. Valid values: ${validStatuses.join(', ')}`
        );
      }
    }
  }

  /**
   * Extract metadata section from content
   */
  extractMetadataSection(content) {
    const lines = content.split('\n');
    const titleIndex = lines.findIndex((line) => line.startsWith('# '));
    if (titleIndex === -1) return null;

    // Find metadata block (lines starting with **)
    const metadataLines = [];
    for (let i = titleIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('**') && line.includes('**:')) {
        metadataLines.push(line);
      } else if (line.trim() === '') {
      } else if (metadataLines.length > 0) {
        break; // End of metadata block
      }
    }

    return metadataLines.join('\n');
  }

  /**
   * Get valid status values for document type
   */
  getValidStatuses(docType) {
    const statusMap = {
      vision: ['Draft', 'Review', 'Approved', 'Active'],
      adr: ['Proposed', 'Accepted', 'Rejected', 'Superseded', 'Deprecated'],
      prd: ['Draft', 'Review', 'Approved', 'Active'],
      epic: ['Planned', 'In Progress', 'Done', 'Cancelled'],
      feature: ['Planned', 'In Development', 'Testing', 'Done', 'Cancelled'],
      task: ['Todo', 'In Progress', 'In Review', 'Done', 'Blocked'],
      spec: ['Draft', 'Review', 'Approved', 'Implemented'],
    };

    return statusMap[docType] || ['Draft', 'Review', 'Approved', 'Active'];
  }

  /**
   * Validate version format
   */
  validateVersionFormat(filePath, content) {
    const versionMatch = content.match(/\*\*Version\*\*:\s*(.+)/);
    if (versionMatch) {
      const version = versionMatch[1].trim();
      const semverPattern = /^\d+\.\d+\.\d+$/;
      if (!semverPattern.test(version)) {
        this.errors.push(
          `${filePath}: Invalid version format '${version}'. Use semantic versioning (x.y.z)`
        );
      }
    }
  }

  /**
   * Validate type-specific requirements
   */
  validateTypeSpecificRequirements(filePath, content, docType) {
    switch (docType) {
      case 'adr':
        this.validateADRRequirements(filePath, content);
        break;
      case 'prd':
        this.validatePRDRequirements(filePath, content);
        break;
      case 'epic':
        this.validateEpicRequirements(filePath, content);
        break;
      case 'feature':
        this.validateFeatureRequirements(filePath, content);
        break;
      case 'task':
        this.validateTaskRequirements(filePath, content);
        break;
      default:
      // No specific requirements
    }
  }

  /**
   * Validate ADR specific requirements
   */
  validateADRRequirements(filePath, content) {
    const requiredSections = [
      'Context and Problem Statement',
      'Decision Drivers',
      'Considered Options',
      'Decision Outcome',
    ];

    for (const section of requiredSections) {
      if (!content.includes(`## ${section}`)) {
        this.errors.push(`${filePath}: Missing required ADR section '${section}'`);
      }
    }
  }

  /**
   * Validate PRD specific requirements
   */
  validatePRDRequirements(filePath, content) {
    const requiredSections = [
      'Executive Summary',
      'User Research & Insights',
      'Requirements',
      'Success Metrics & Analytics',
    ];

    for (const section of requiredSections) {
      if (!content.includes(`## ${section}`)) {
        this.errors.push(`${filePath}: Missing required PRD section '${section}'`);
      }
    }
  }

  /**
   * Validate Epic specific requirements
   */
  validateEpicRequirements(filePath, content) {
    if (!content.includes('## User Stories')) {
      this.errors.push(`${filePath}: Epic must include User Stories section`);
    }

    if (!content.includes('## Success Metrics')) {
      this.errors.push(`${filePath}: Epic must include Success Metrics section`);
    }
  }

  /**
   * Validate Feature specific requirements
   */
  validateFeatureRequirements(filePath, content) {
    if (!content.includes('## Acceptance Criteria')) {
      this.errors.push(`${filePath}: Feature must include Acceptance Criteria section`);
    }

    if (!content.includes('**As a**') && !content.includes('## User Story')) {
      this.warnings.push(`${filePath}: Feature should include user story format`);
    }
  }

  /**
   * Validate Task specific requirements
   */
  validateTaskRequirements(filePath, content) {
    if (!content.includes('## Acceptance Criteria')) {
      this.errors.push(`${filePath}: Task must include Acceptance Criteria section`);
    }

    if (!content.includes('## Technical Details')) {
      this.errors.push(`${filePath}: Task must include Technical Details section`);
    }
  }

  /**
   * Validate cross-references between documents
   */
  async validateCrossReferences(docFiles) {
    console.log('🔗 Validating cross-references...');

    const docMap = new Map();

    // Build map of documents
    for (const file of docFiles) {
      const relativePath = path.relative(this.docsDir, file);
      const content = fs.readFileSync(file, 'utf8');
      docMap.set(relativePath, content);
    }

    // Check references
    for (const [filePath, content] of docMap) {
      const references = this.extractReferences(content);

      for (const ref of references) {
        if (ref.startsWith('docs/') || ref.includes('.md')) {
          const referencedFile = this.resolveReference(ref, filePath);
          if (referencedFile && !docMap.has(referencedFile)) {
            this.warnings.push(`${filePath}: Referenced document not found '${ref}'`);
          }
        }
      }
    }
  }

  /**
   * Extract references from document content
   */
  extractReferences(content) {
    const references = [];

    // Find markdown links
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = linkPattern.exec(content)) !== null) {
      references.push(match[2]);
    }

    // Find inline references
    const inlineRefPattern = /\*\*([^*]+)\*\*:\s*\[Link to ([^\]]+)\]/g;
    while ((match = inlineRefPattern.exec(content)) !== null) {
      references.push(match[2]);
    }

    return references;
  }

  /**
   * Resolve relative reference to absolute path
   */
  resolveReference(ref, fromFile) {
    if (ref.startsWith('http') || ref.startsWith('#')) {
      return null; // External or internal link
    }

    if (ref.startsWith('docs/')) {
      return ref.substring(5); // Remove 'docs/' prefix
    }

    // Resolve relative to current file
    const fromDir = path.dirname(fromFile);
    return path.normalize(path.join(fromDir, ref));
  }

  /**
   * Validate version consistency across related documents
   */
  async validateVersionConsistency(docFiles) {
    console.log('📊 Validating version consistency...');

    // This is a simplified check - in practice, you'd want more sophisticated
    // dependency tracking and compatibility checking

    for (const file of docFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const versionMatch = content.match(/\*\*Version\*\*:\s*(.+)/);

      if (versionMatch) {
        const version = versionMatch[1].trim();
        const filePath = path.relative(this.docsDir, file);

        // Check if version follows semantic versioning
        const [major, minor, patch] = version.split('.').map(Number);
        if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
          this.errors.push(`${filePath}: Invalid version format '${version}'`);
        }
      }
    }
  }

  /**
   * Report validation results
   */
  reportResults() {
    console.log('\n📋 Validation Results:');
    console.log('='.repeat(50));

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All documents are valid!');
      return;
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ Errors (${this.errors.length}):`);
      this.errors.forEach((error) => console.log(`   ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  Warnings (${this.warnings.length}):`);
      this.warnings.forEach((warning) => console.log(`   ${warning}`));
    }

    console.log(`\n📊 Summary: ${this.errors.length} errors, ${this.warnings.length} warnings`);
  }
}

// CLI execution
if (require.main === module) {
  const validator = new DocumentValidator();
  validator.validate().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = DocumentValidator;
