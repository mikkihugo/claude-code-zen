#!/usr/bin/env node

/* Multi-System Integration Demo */
/* DEMONSTRATES ENHANCED LANCEDB, KUZU, AND VISION-TO-CODE CAPABILITIES */
/* Shows coordinated operations across all three systems */

import MultiSystemCoordinator from '../src/integration/multi-system-coordinator.js';

class MultiSystemDemo {
  constructor() {
    this.coordinator = null;
    this.demoResults = {
      lancedb: {},
      kuzu: {},
      visionToCode: {},
      startTime: Date.now(),
    };
  }

  async run() {
    console.warn('Multi-System Integration Demo Starting...\n');
    try {
      // Initialize the coordinator
      await this.initializeCoordinator();
      // Run individual system demos
      await this.runLanceDBDemo();
      await this.runKuzuDemo();
      await this.runVisionDemo();
      // Run integration demos
      await this.runIntegrationDemo();
      // Generate comprehensive report
      await this.generateReport();
      console.warn('\nMulti-System Demo completed successfully!');
    } catch(error) {
      console.error('\nDemo failed:', error.message);
      throw error;
    } finally {
      if(this.coordinator) {
        await this.coordinator.close();
      }
    }
  }

  async initializeCoordinator() {
    console.warn('Initializing Multi-System Coordinator...');
    this.coordinator = new MultiSystemCoordinator({
      lancedb: {
        dbPath: './demo-data/vectors',
        vectorDim: 128, // Smaller dimension for demo
      },
      kuzu: {
        dbPath: './demo-data/graph',
        dbName: 'demo-graph',
        enableAnalytics: true,
      },
      visionToCode: {
        outputDir: './demo-data/generated-code',
        enableAnalytics: true,
      },
      enableCrossSystemAnalytics: true,
      enableMemorySharing: true,
      enableIntelligentRouting: true,
    });

    const result = await this.coordinator.initialize();
    console.warn('Coordinator initialized');
    console.warn(`   - Systems: ${Object.keys(result.systems).join(', ')}`);
    console.warn(`   - Features: ${Object.keys(result.features).join(', ')}\n`);
  }

  async runLanceDBDemo() {
    console.warn('Running LanceDB Enhanced Demo...');

    // Generate sample embeddings
    const sampleData = [
      { text: 'Advanced AI research paper', category: 'research' },
      { text: 'Machine learning tutorial', category: 'education' },
      { text: 'Deep learning framework', category: 'tools' },
    ];

    for (const item of sampleData) {
      await this.coordinator.lancedb.addDocument(item);
    }

    // Perform similarity search
    const results = await this.coordinator.lancedb.search('AI research', { limit: 3 });
    this.demoResults.lancedb = { documentsAdded: sampleData.length, searchResults: results.length };

    console.warn(`   - Added ${sampleData.length} documents`);
    console.warn(`   - Search returned ${results.length} results\n`);
  }

  async runKuzuDemo() {
    console.warn('Running Kuzu Graph Database Demo...');

    // Create sample knowledge graph
    const entities = ['AI', 'Machine Learning', 'Deep Learning', 'Neural Networks'];
    const relationships = [
      ['AI', 'INCLUDES', 'Machine Learning'],
      ['Machine Learning', 'INCLUDES', 'Deep Learning'],
      ['Deep Learning', 'USES', 'Neural Networks'],
    ];

    for (const entity of entities) {
      await this.coordinator.kuzu.createNode('Concept', { name: entity });
    }

    for (const [from, relation, to] of relationships) {
      await this.coordinator.kuzu.createRelationship(from, relation, to);
    }

    // Perform graph traversal
    const paths = await this.coordinator.kuzu.findPaths('AI', 'Neural Networks');
    this.demoResults.kuzu = { nodesCreated: entities.length, relationshipsCreated: relationships.length, pathsFound: paths.length };

    console.warn(`   - Created ${entities.length} nodes`);
    console.warn(`   - Created ${relationships.length} relationships`);
    console.warn(`   - Found ${paths.length} paths\n`);
  }

  async runVisionDemo() {
    console.warn('Running Vision-to-Code Demo...');

    // Simulate processing UI screenshots
    const mockScreenshots = [
      'login-form.png',
      'dashboard-layout.png',
      'data-table.png',
    ];

    const generatedComponents = [];
    for (const screenshot of mockScreenshots) {
      const component = await this.coordinator.visionToCode.processScreenshot(screenshot);
      generatedComponents.push(component);
    }

    this.demoResults.visionToCode = { screenshotsProcessed: mockScreenshots.length, componentsGenerated: generatedComponents.length };

    console.warn(`   - Processed ${mockScreenshots.length} screenshots`);
    console.warn(`   - Generated ${generatedComponents.length} React components\n`);
  }

  async runIntegrationDemo() {
    console.warn('Running Cross-System Integration Demo...');

    // Demonstrate cross-system analytics
    const analytics = await this.coordinator.getCrossSystemAnalytics();

    // Demonstrate intelligent routing
    const routingResults = await this.coordinator.intelligentRoute({
      query: 'Find AI research papers and related concepts',
      preferredSystems: ['lancedb', 'kuzu'],
    });

    console.warn(`   - Analytics gathered from ${analytics.systemCount} systems`);
    console.warn(`   - Intelligent routing processed ${routingResults.length} operations\n`);
  }

  async generateReport() {
    console.warn('Generating Comprehensive Demo Report...');

    const totalDuration = Date.now() - this.demoResults.startTime;

    console.warn('\n' + '='.repeat(50));
    console.warn('MULTI-SYSTEM INTEGRATION DEMO REPORT');
    console.warn('='.repeat(50));
    console.warn(`Total Duration: ${totalDuration}ms`);
    console.warn(`\nLanceDB Results:`);
    console.warn(`  - Documents Added: ${this.demoResults.lancedb.documentsAdded}`);
    console.warn(`  - Search Results: ${this.demoResults.lancedb.searchResults}`);
    console.warn(`\nKuzu Results:`);
    console.warn(`  - Nodes Created: ${this.demoResults.kuzu.nodesCreated}`);
    console.warn(`  - Relationships: ${this.demoResults.kuzu.relationshipsCreated}`);
    console.warn(`  - Paths Found: ${this.demoResults.kuzu.pathsFound}`);
    console.warn(`\nVision-to-Code Results:`);
    console.warn(`  - Screenshots Processed: ${this.demoResults.visionToCode.screenshotsProcessed}`);
    console.warn(`  - Components Generated: ${this.demoResults.visionToCode.componentsGenerated}`);
    console.warn('='.repeat(50));
  }
}

// Execute demo if run directly
if (import.meta.url === 'file://' + process.argv[1]) {
  const demo = new MultiSystemDemo();
  demo.run().catch(console.error);
}

export default MultiSystemDemo;
