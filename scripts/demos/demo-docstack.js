#!/usr/bin/env node

/* Live Demo: Creating documents through the MCP document stack */

// ANSI colors for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Document examples to create
const documentExamples = [
  {
    service: 'unified-storage',
    docType: 'service-adr',
    docId: 'use-postgres-for-storage',
    content: `# ADR: Use PostgreSQL for Primary Storage

## Status
Accepted - 2025-01-17

## Context
Our application needs a reliable, scalable database solution.

## Decision
We will use PostgreSQL as our primary storage solution.

## Consequences
- Reliable ACID transactions
- Excellent performance for complex queries
- Strong ecosystem and tooling support
- Well-known by the team`,
  },
  {
    service: 'performance-monitoring',
    docType: 'technical-spec',
    docId: 'metrics-collection-spec',
    content: `# Performance Metrics Collection Specification

## Overview
This document outlines the technical specifications for collecting and aggregating performance metrics across all services.

## Requirements
- Real-time metric collection
- Configurable sampling rates
- Multi-dimensional metric support
- Efficient storage and retrieval

## Implementation
### Metric Types
- Counters: Track event counts
- Gauges: Track current values
- Histograms: Track value distributions
- Timers: Track operation durations

### Collection Strategy
Metrics will be collected using a push-based approach with local aggregation.`,
  },
  {
    service: 'ai-integration',
    docType: 'user-guide',
    docId: 'getting-started-ai',
    content: `# Getting Started with AI Integration

## Introduction
Welcome to the AI Integration service! This guide will help you get started with integrating AI capabilities into your applications.

## Quick Start
1. Install the AI client library
2. Configure your API credentials
3. Make your first AI request

## Basic Usage
\`\`\`javascript
import { AIClient } from '@claude-zen/ai-client';

const client = new AIClient({
  apiKey: process.env.CLAUDE_API_KEY
});

const response = await client.complete({
  prompt: 'Explain quantum computing',
  maxTokens: 100
});
\`\`\`

## Best Practices
- Always handle errors gracefully
- Implement rate limiting
- Cache responses when appropriate
- Monitor usage and costs`,
  },
];

class DocStackDemo {
  constructor() {
    this.colors = colors;
    this.createdDocs = [];
  }

  log(message, color = 'reset') {
    console.log(`${this.colors[color]}${message}${this.colors.reset}`);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async createDocument(docExample) {
    this.log(`\n📄 Creating document: ${docExample.docId}`, 'cyan');
    this.log(`   Service: ${docExample.service}`, 'blue');
    this.log(`   Type: ${docExample.docType}`, 'blue');

    // Simulate document creation process
    this.log('   ⏳ Validating content...', 'yellow');
    await this.delay(500);

    this.log('   ⏳ Processing metadata...', 'yellow');
    await this.delay(300);

    this.log('   ⏳ Storing document...', 'yellow');
    await this.delay(400);

    // Simulate success
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.createdDocs.push({
      id: docId,
      ...docExample,
      createdAt: new Date().toISOString(),
      status: 'created',
    });

    this.log(`   ✅ Document created successfully!`, 'green');
    this.log(`   📍 Document ID: ${docId}`, 'magenta');

    return docId;
  }

  async searchDocuments(query) {
    this.log(`\n🔍 Searching documents for: "${query}"`, 'cyan');
    await this.delay(300);

    // Simulate search results
    const results = this.createdDocs.filter(doc =>
      doc.content.toLowerCase().includes(query.toLowerCase()) ||
      doc.docType.toLowerCase().includes(query.toLowerCase()) ||
      doc.service.toLowerCase().includes(query.toLowerCase()),
    );

    this.log(`   📊 Found ${results.length} matching documents`, 'green');

    results.forEach((doc, index) => {
      this.log(`   ${index + 1}. ${doc.docId} (${doc.service})`, 'blue');
    });

    return results;
  }

  async demonstrateVersioning(docId) {
    this.log(`\n📝 Demonstrating document versioning for: ${docId}`, 'cyan');

    // Simulate version creation
    for (let version = 2; version <= 3; version++) {
      this.log(`   ⏳ Creating version ${version}...`, 'yellow');
      await this.delay(300);
      this.log(`   ✅ Version ${version} created`, 'green');
    }

    this.log(`   📚 Document now has 3 versions`, 'magenta');
  }

  async demonstrateCollaboration() {
    this.log(`\n👥 Demonstrating collaborative editing...`, 'cyan');

    const collaborators = ['Alice', 'Bob', 'Charlie'];

    for (const collaborator of collaborators) {
      this.log(`   👤 ${collaborator} is editing...`, 'yellow');
      await this.delay(400);
      this.log(`   💾 ${collaborator} saved changes`, 'green');
    }

    this.log(`   🤝 All collaborators synced successfully`, 'magenta');
  }

  async runDemo() {
    this.log('🚀 Starting DocStack Live Demo', 'bright');
    this.log('='.repeat(50), 'bright');

    try {
      // Create documents
      this.log('\n📋 PHASE 1: Document Creation', 'bright');
      for (const docExample of documentExamples) {
        await this.createDocument(docExample);
      }

      // Search demonstration
      this.log('\n📋 PHASE 2: Search & Discovery', 'bright');
      await this.searchDocuments('PostgreSQL');
      await this.searchDocuments('performance');
      await this.searchDocuments('AI');

      // Versioning demonstration
      this.log('\n📋 PHASE 3: Version Control', 'bright');
      if (this.createdDocs.length > 0) {
        await this.demonstrateVersioning(this.createdDocs[0].docId);
      }

      // Collaboration demonstration
      this.log('\n📋 PHASE 4: Collaborative Editing', 'bright');
      await this.demonstrateCollaboration();

      // Summary
      this.log('\n📊 DEMO SUMMARY', 'bright');
      this.log('='.repeat(50), 'bright');
      this.log(`✅ Documents Created: ${this.createdDocs.length}`, 'green');
      this.log(`✅ Services Covered: ${new Set(this.createdDocs.map(d => d.service)).size}`, 'green');
      this.log(`✅ Document Types: ${new Set(this.createdDocs.map(d => d.docType)).size}`, 'green');
      this.log('✅ Search Functionality: Demonstrated', 'green');
      this.log('✅ Version Control: Demonstrated', 'green');
      this.log('✅ Collaboration: Demonstrated', 'green');

      this.log('\n🎉 DocStack Demo completed successfully!', 'bright');

    } catch (error) {
      this.log(`\n❌ Demo failed: ${error.message}`, 'red');
      throw error;
    }
  }
}

// Execute demo if run directly
if (import.meta.url === 'file://' + process.argv[1]) {
  const demo = new DocStackDemo();
  demo.runDemo().catch(console.error);
}

export default DocStackDemo;
