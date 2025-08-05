#!/usr/bin/env node

/**
 * SPARC Template Engine Database Integration Demo
 * 
 * Demonstrates the database-driven template engine with multi-backend support
 */

import { TemplateEngine } from './core/template-engine.js';

async function demonstrateDatabaseDrivenEngine() {
  console.log('🚀 SPARC Database-Driven Template Engine Demo\n');

  try {
    // Test different backend configurations
    const backends = [
      {
        name: 'SQLite Backend',
        config: {
          backend: {
            type: 'sqlite',
            path: './demo-data/sparc-sqlite.db',
            enabled: true,
          },
          namespace: 'sparc-demo-sqlite',
        }
      },
      {
        name: 'JSON Backend',
        config: {
          backend: {
            type: 'json',
            path: './demo-data/sparc-json',
            enabled: true,
          },
          namespace: 'sparc-demo-json',
        }
      }
    ];

    for (const { name, config } of backends) {
      console.log(`\n📋 Testing ${name}...`);
      
      const engine = new TemplateEngine(config);
      await engine.initialize();

      // Test template operations
      const templates = engine.getAllTemplates();
      console.log(`✅ Loaded ${templates.length} templates from ${name}`);

      // Test template application with database persistence
      const projectSpec = {
        id: 'demo-project',
        name: 'Database-Driven Cache System',
        domain: 'memory-systems',
        complexity: 'high',
        requirements: [
          'Sub-10ms access times',
          'Multi-backend support (SQLite, LanceDB, JSON)',
          'Automatic failover and recovery'
        ],
        constraints: [
          'Must work with existing claude-code-zen infrastructure',
          'Database-first approach required'
        ]
      };

      const result = await engine.applyTemplate(
        templates.find(t => t.domain === 'memory-systems'),
        projectSpec
      );

      console.log(`🔧 Applied template: ${result.templateId}`);
      console.log(`📊 Customizations: ${result.customizations.length}`);
      console.log(`⚠️ Warnings: ${result.warnings.length}`);

      // Test database status
      const dbStatus = await engine.getDatabaseStatus();
      console.log(`💾 Database Status:`, {
        backend: dbStatus.backend,
        healthy: dbStatus.healthy,
        templateCount: dbStatus.templateCount,
        namespace: dbStatus.namespace
      });

      // Test usage statistics
      const stats = await engine.getTemplateStats();
      console.log(`📈 Usage Statistics:`, {
        totalTemplates: stats.totalTemplates,
        backend: stats.databaseInfo.backend,
        lastSync: stats.databaseInfo.lastSync.toISOString(),
        domainCoverage: Object.keys(stats.domainCoverage).length
      });
    }

    console.log('\n✅ Database-driven template engine demonstration completed!');
    console.log('\n🎯 Key Features Demonstrated:');
    console.log('  • Multi-backend support (SQLite, JSON)');
    console.log('  • Template persistence and caching');
    console.log('  • Usage statistics tracking');
    console.log('  • Database health monitoring');
    console.log('  • Application result storage');
    console.log('  • Namespace isolation');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run the demonstration
demonstrateDatabaseDrivenEngine().catch(console.error);