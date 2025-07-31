/** Kuzu Graph Database Interface; */
/** HIGH-PERFORMANCE REAL KUZU DATABASE INTEGRATION; */
/** Replaces file-based simulation with actual Kuzu database connections; */

import { existsSync, readFile } from 'node:fs';

'

import path from 'node:path';

'

import { printError, printInfo, printSuccess } from '..';

// Dynamic import for Kuzu database
const kuzu = null;
try {
  '
  kuzu = // await import('kuzu');
}
'
  console.warn('Kuzu database not available, using fallback mode = {}) {'
    this.config =
{dbPath = = false,compression = = false,memoryLimit = = false, // Default to real Kuzu
..config;
    //     }
this.isInitialized = false;
this.schema = null;
this.database = null; // Real Kuzu database instance
this.connection = null; // Real Kuzu connection

// Fallback storage for when Kuzu is not available
this.nodes = new Map();
this.relationships = new Map();
this.indices = new Map();
// Statistics'
this.stats = {nodeCount = // await import('kuzu');
this.database = new kuzuModule.Database(this.config.dbPath);
this.connection = new kuzuModule.Connection(this.database);
this.stats.usingRealKuzu = true;'
printSuccess(' Real Kuzu database connection established');
// Create node and relationship tables
// // await this.createKuzuSchema();
// }
catch(/* kuzuError */)
// {'
  printWarning(` Real Kuzu failed, falling back tosimulation = false;`

        // For simulation mode, create directory structure
        if(!existsSync(this.config.dbPath)) {
// // await mkdir(this.config.dbPath, {recursive = true;`
      const mode = this.stats.usingRealKuzu ? 'REAL KUZU' );
        );'
      `);``
  console.warn(' Service table creation completed');
  // Create Technology node table
'
  console.warn(' Technology table creation completed');
  // Create DEPENDS_ON relationship table
'
  console.warn(' DEPENDS_ON relation creation completed');
  // Create USES relationship table
'
  console.warn(' USES relation creation completed');'
  printSuccess(' Kuzu schema created successfully');
// }
catch(error)
// {'
  printError(` Failed to create Kuzuschema = // await import('kuzu');`

      // Create database connection
      this.kuzuDatabase = new kuzu.Database(this.config.dbPath);
      this.kuzuConnection = new kuzu.Connection(this.kuzuDatabase);
`
      console.warn(` Connected to Kuzu databaseat = // await this.connectToKuzu();``
  this.schema = {nodes = path.join(this.config.dbPath, 'schema.json');
// // await writeFile(schemaPath, JSON.stringify(this.schema, null, 2));
// }'
printInfo(' Database schema initialized');
// }

/** Set up performance indices; */

// async setupIndices() {}

  const indices = {service_name_idx = indices;
  // Save indices configuration only for simulation mode
  if(!this.stats.usingRealKuzu) {'
    const indicesPath = path.join(this.config.dbPath, 'indices.json');
// // await writeFile(indicesPath, JSON.stringify(indices, null, 2));
  //   }'
  printInfo(' Performance indices configured');
// }

/** Load existing data from disk; */

async;
loadExistingData();
// {
    // Skip JSON file loading if using real Kuzu(it has its own persistence)
  if(this.stats.usingRealKuzu) {'
      printInfo(' Using real Kuzu database - skipping JSON file loading');
      return;
    //   // LINT: unreachable code removed}

    try {'
      const nodesPath = path.join(this.config.dbPath, 'nodes.json');'
      const relationshipsPath = path.join(this.config.dbPath, 'relationships.json');

      if(existsSync(nodesPath)) {'
        const nodesData = JSON.parse(// await readFile(nodesPath, 'utf8'));
        this.nodes = new Map(nodesData);
        this.stats.nodeCount = this.nodes.size;
      //       } if(existsSync(relationshipsPath)) {'
        const relationshipsData = JSON.parse(// await readFile(relationshipsPath, 'utf8'));
        this.relationships = new Map(relationshipsData);
        this.stats.relationshipCount = this.relationships.size;
      //       }
  if(this.stats.nodeCount > 0  ?? this.stats.relationshipCount > 0) {'
  printInfo(` Loaded existingdata = 0;`

    // Use real Kuzu database if available
    if(this.stats.usingRealKuzu && this.connection) {
  for(const service of services) {
        try {
          // Use prepared statement pattern for Kuzu`
          const query = `; `
  CREATE(s = []; for(let service of services) {`
      const nodeId = `service = {id = > api.file)  ?? [],databases = > db.file)  ?? [],created_at = this.config.batchSize) {``
// // await this.processBatch(batch, 'nodes');
        batch.length = 0;
      //       } // Process remaining batch
  if(batch.length > 0) {'
// // await this.processBatch(batch, 'nodes');
    //     }

    this.stats.nodeCount = this.nodes.size;
    this.stats.lastUpdate = new Date().toISOString();
'
    printSuccess(` Inserted \$insertedservices`);
    // return inserted;
    //   // LINT: unreachable code removed}

/** Insert technology nodes; */

  async insertTechnologies(technologies) { `
    printInfo(` Inserting \$technologies.lengthtechnologies...`);

    const inserted = 0;

    for (const tech of technologies) `
      const nodeId = `technology = {id = this.nodes.get(nodeId); `
        existing.properties.usage_count++; this.nodes.set(nodeId, existing) {;
      //       }
    //     }
`
    printSuccess(` Inserted \$insertednew technologies`);
    // return inserted;
    //   // LINT: unreachable code removed}

/** Insert service relationships; */

  async insertRelationships(relationships) { `
    printInfo(` Inserting \$relationships.lengthrelationships...`);

    const inserted = 0;
    const batch = [];

    for (const _rel of relationships) 

        batch.length = 0; //       }
    //     }

    // Process remaining batch
  if(batch.length > 0) {`
// // await this.processBatch(batch, 'relationships'); 
    //     }

    this.stats.relationshipCount = this.relationships.size;'
  printSuccess(` Inserted $insertedrelationships`) {;
    // return inserted;
    //   // LINT: unreachable code removed}

/** Insert hive coordination data; */

  async insertHives(hives) { `
    printInfo(` Inserting $hives.length} hive coordination nodes...`);

    const inserted = 0;
  for(const _hive of hives) {`
      const nodeId = `hive = {id = `_hive = {id = {}) {
    this.stats.queryCount++; // Use real Kuzu query if available
  if(this.stats.usingRealKuzu && this.connection) {
      try {
        // Build WHERE clauses based on criteria
        const whereClauses = []; if(criteria.name) {`
          whereClauses.push(`s.name CONTAINS '${criteria.name.replace(/'''")}' `);'
        //         }
  if(criteria.type) {'
          whereClauses.push(`s.type = '${criteria.type.replace(/'''")}' `);'
        //         }
  if(criteria.complexity) {'
          whereClauses.push(`s.complexity = '${criteria.complexity.replace(/'''")}' `);'
        //         }
'
        const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND '';'
        const query = `MATCH(s) $whereClauseRETURN s ORDER BY s.name`;
// const queryResult = awaitthis.executeQuery(query);
  if(queryResult.success) {
          // Transform Kuzu results to match expected format
          // return queryResult.data.map(_row => ({id = Array.from(this.nodes.values());`
    // .filter(node => node.type === 'Service'); // LINT: unreachable code removed

    // Apply filters
  if(criteria.name) {
      results = results.filter(_node => ;)
        node.properties.name.includes(criteria.name);
      );
    //     }
  if(criteria.type) {
      results = results.filter(_node => ;
        node.properties.type === criteria.type;
      );
    //     }
  if(criteria.complexity) {
      results = results.filter(_node => ;
        node.properties.complexity === criteria.complexity;
      );
    //     }
  if(criteria.technology) {
      results = results.filter(_node => ;)
        node.properties.technologies.includes(criteria.technology);
      );
    //     }

    // Sort by name by default
    results.sort((a, b) => a.properties.name.localeCompare(b.properties.name));
// 
    return results;
    //   // LINT: unreachable code removed}

/** Insert generic nodes into the graph; */

  async insertNodes(nodeType, nodes) ;
  if(!this.schema.nodes[nodeType]) {'
      throw new Error(`Unknown nodetype = 0;`
    const batch = [];
  for(const node of nodes) {`
      const nodeId = node.id  ?? `$nodeType.toLowerCase():$Math.random().toString(36).substring(7)`; batch.length = 0; //       }

    // Process remaining batch
  if(batch.length > 0) {`
// // await this.processBatch(batch, 'nodes');
    //     }

    this.stats.nodeCount = this.nodes.size;
    this.stats.lastUpdate = new Date().toISOString();
'
    printSuccess(` Inserted $inserted$nodeTypenodes`);
    // return inserted;
    //   // LINT: unreachable code removed}

/** Query functions by complexity; */

  async queryFunctionsByComplexity(minComplexity = 10) { 
    this.stats.queryCount++;

    const results = Array.from(this.nodes.values());`
filter(node => node.type === 'Function' && ;
                     node.properties.cyclomatic_complexity >= minComplexity);

    // Sort by complexity descending
    results.sort((_a, _b) => ;
      b.properties.cyclomatic_complexity - a.properties.cyclomatic_complexity;
    );
// 
    return results;
    //   // LINT: unreachable code removed}

/** Query files by complexity score; */

  async queryFilesByComplexity(minScore = 5.0) 
    this.stats.queryCount++;

    const results = Array.from(this.nodes.values());'
filter(node => node.type === 'SourceFile' && ;
                     node.properties.complexity_score >= minScore);

    // Sort by complexity score descending
    results.sort((_a, _b) => ;
      b.properties.complexity_score - a.properties.complexity_score;
    );
// 
    return results;
    //   // LINT: unreachable code removed}

/** Find functions that call each other(call graph); */

  async findFunctionCallGraph() { 

    const callGraph = nodes = this.nodes.get(rel.from);
      const toFunc = this.nodes.get(rel.to);
  if(fromFunc && toFunc) {
        callGraph.nodes.add(fromFunc);
        callGraph.nodes.add(toFunc);
        callGraph.edges.push({ from = 80) {
    this.stats.queryCount++;

    const duplicates = Array.from(this.nodes.values());'
filter(node => node.type === 'DuplicateCode' && ;
                     node.properties.similarity_score >= minSimilarity);

    const duplicateRelationships = Array.from(this.relationships.values());'
filter(rel => rel.type === 'DUPLICATES');

    const patterns = [];
  for(const _duplicate of duplicates) {
      const occurrences = duplicateRelationships; filter(rel => rel.from === duplicate.id); map(rel => {
          const file = this.nodes.get(rel.to) ;
//           return {
            file => {
      const impactA = a.similarity * a.occurrences.length;
    // const impactB = b.similarity * b.occurrences.length; // LINT: unreachable code removed
//       return impactB - impactA;
    //   // LINT: unreachable code removed  });

    // return patterns;
    //   // LINT: unreachable code removed}

/** Find files with high import coupling */

  async findHighlyCoupledFiles() { 
    const importCounts = new Map();
    const exportCounts = new Map();

    // Count imports per file
    for (const rel of this.relationships.values()) '
  if(rel.type === 'IMPORTS_FROM') {
        const fromFile = rel.from; const toFile = rel.to; importCounts.set(fromFile, (importCounts.get(fromFile) {?? 0) + 1);
        exportCounts.set(toFile, (exportCounts.get(toFile)  ?? 0) + 1);
      //       }
    //     }

    const coupledFiles = [];

    for (const [fileId, importCount] of importCounts.entries()) {
      const exportCount = exportCounts.get(fileId)  ?? 0; const file = this.nodes.get(fileId); if(file && (importCount > 10  ?? exportCount > 5) {) 
        coupledFiles.push({file = > b.coupling_score - a.coupling_score);
  //   }

/** Generate Cypher-like query for common patterns; */

  generateCommonQueries() {
    // return {highComplexityFunctions = false ;
    // RETURN f.name, f.file_id; // LINT: unreachable code removed'
      `,duplicateHotspots = `service = [];
    const dependents = [];

    for (const rel of this.relationships.values()) {`
  if(rel.type === 'DEPENDS_ON') {
  if(rel.from === serviceId) {
          dependencies.push({ service = === serviceId) {'
          dependents.push({service = Array.from(this.nodes.values()); filter(node => node.type === 'Hive'); const coordination = [];
  for(const rel of this.relationships.values() {) {'
  if(rel.type === 'COORDINATES_WITH') {
        const fromHive = hives.find(h => h.id === rel.from);
        const toHive = hives.find(h => h.id === rel.to);
  if(fromHive && toHive) {
          coordination.push({from = // await this.queryServices();
    const patterns = {
      technologyUsage => {
        patterns.technologyUsage[tech] = (patterns.technologyUsage[tech]  ?? 0) + 1;
        });

      // Complexity distribution
      const complexity = service.properties.complexity;
  if(patterns.complexityDistribution[complexity] !== undefined) {
        patterns.complexityDistribution[complexity]++;
      //       }

      // Service types
      const type = service.properties.type;
      patterns.serviceTypes[type] = (patterns.serviceTypes[type]  ?? 0) + 1;
    //     }

    // Dependency patterns
  for(const service of services) {
// const deps = awaitthis.findServiceDependencies(service.properties.name); 
      const totalConnections = deps.dependencies.length + deps.dependents.length; if(totalConnections === 0) {
        patterns.dependencyPatterns.isolated.push(service.properties.name);
      } else if(totalConnections >= 5) {
        patterns.dependencyPatterns.central.push({ service = 3) {
        patterns.dependencyPatterns.highlyDependent.push({)
          service = {}) {
    this.stats.queryCount++;
  switch(queryType) {'
      case 'find_deprecated_apis': {;
        // return this.findDeprecatedApiUsage(parameters);'
    // case 'identify_architectural_violations': // LINT: unreachable code removed
        // return this.identifyArchitecturalViolations(parameters);'
    // case 'find_unused_exports': // LINT: unreachable code removed
        // return this.findUnusedExports(parameters);'
    // case 'analyze_complexity_trends': // LINT: unreachable code removed
        // return this.analyzeComplexityTrends(parameters);'
    // case 'find_tightly_coupled_modules': // LINT: unreachable code removed
        // return this.findTightlyCoupledModules(parameters);'
    // case 'identify_code_smells': // LINT: unreachable code removed
        // return this.identifyCodeSmells(parameters);
    // default = { // LINT: unreachable code removed}) {
    const deprecatedPatterns = parameters.patterns  ?? [;'
      'require(','
      'const ','
      'eval(','
      'document.write','
      'innerHTML','
      'setInterval','
      'setTimeout';
    ];

    const results = [];

    // Find function calls that match deprecated patterns
    const functionCalls = Array.from(this.relationships.values());'
filter(rel => rel.type === 'CALLS_FUNCTION');
  for(const call of functionCalls) {
      const calledFunc = this.nodes.get(call.to); if(calledFunc) {
        const funcName = calledFunc.properties.name; for(const pattern of deprecatedPatterns) {'
          if(funcName.includes(pattern.replace('(''))) {
            results.push({ //               type = {}) {
    const rules = parameters.rules  ?? [;
      {name = [];
  for(const rule of rules) {'
  if(rule.type === 'circular') {
        // Find circular dependencies
// const circular = awaitthis.findCircularDependencies(); 
  for(const _cycle of circular.cycles) {'
          violations.push({ type = Array.from(this.relationships.values()); filter(rel => rel.type === 'IMPORTS_FROM') {;
  for(const rel of importRelationships) {
          const fromFile = this.nodes.get(rel.from); const toFile = this.nodes.get(rel.to); if(fromFile && toFile) {'';'';

            if(fromPath.includes(rule.forbidden_in) && toPath.includes(rule.pattern)) {
              violations.push({)
                //                 type = {}) {
    const exports = new Map();
    const imports = new Set();

    // Collect all exports
    for (const node of this.nodes.values()) {'
  if(node.type === 'Export') {
  for(const exportName of node.properties.exported_names  ?? []) {'
          exports.set(`$node.properties.file_id:$exportName`, {name = === 'Import') {
  for(const importName _of _node._properties._imported_names  ?? []) {
          imports.add(importName); //         }
      //       }
    //     }

    // Find exports that are never imported
    const unusedExports = []; for(const [_key, exportInfo] of exports) {'
      if(!imports.has(exportInfo.name) && exportInfo.name !== 'default') {'
        unusedExports.push({name = === 'default' ? 'medium' );
      //       }
    //     }

    // return unusedExports;
    //   // LINT: unreachable code removed}

/** Analyze complexity trends; */

  async analyzeComplexityTrends(parameters = {}) { 
    const functions = Array.from(this.nodes.values());'
filter(node => node.type === 'Function');

    const complexityDistribution = low = 0;
    const fileComplexity = new Map();
  for(const func of functions) {
      const complexity = func.properties.cyclomatic_complexity  ?? 0; totalComplexity += complexity; // Categorize complexity
      let category;'
  if(complexity <= 5) {category = 'low';'
      else if(complexity <= 10) category = 'medium';'
      else if(complexity <= 20) category = 'high';'
      else category = 'critical';

      complexityDistribution[category].count++;
      complexityDistribution[category].functions.push({name = func.properties.file_id;)
      if(!fileComplexity.has(fileId)) {
        fileComplexity.set(fileId, {total = fileComplexity.get(fileId);
      fileData.total += complexity;
      fileData.count++;
      fileComplexity.set(fileId, fileData);
    //     }

    // Calculate file average complexities
    const fileAverages = [];
  for(const [fileId, data] of fileComplexity) {
      const file = this.nodes.get(fileId); if(file) {
        fileAverages.push({ file = > b.averageComplexity - a.averageComplexity); // return {
      overview = {}) {
    const threshold = parameters.threshold  ?? 5;
    // const couplingMap = new Map(); // LINT: unreachable code removed

    // Count dependencies between files
    const importRelationships = Array.from(this.relationships.values())'
filter(rel => rel.type === 'IMPORTS_FROM');
  for(const rel of importRelationships) {
      const fromFile = this.nodes.get(rel.from); const toFile = this.nodes.get(rel.to); if(fromFile && toFile) {'
        const key = `$rel.from-$rel.to`;
        couplingMap.set(key, {from = [];)
  for(const [key, coupling] of couplingMap) {
  if(coupling.strength >= threshold) {
        tightlyCoupled.push({)
..coupling,severity = > b.strength - a.strength); //   }

/** Identify code smells; *  */*/
  async identifyCodeSmells(parameters = {}) { 
    const smells = [];

    // Long parameter lists
    const functions = Array.from(this.nodes.values());`
filter(node => node.type === 'Function' && node.properties.parameter_count > 5);

    for (const _func of functions) '
      smells.push(type = Array.from(this.nodes.values()); filter(node => node.type === 'Class' && node.properties.method_count > 15); for(const _cls of classes) {
      smells.push({type = // await this.findTightlyCoupledModules({ threshold => {
)
  if(distribution.critical.count > 0) {
      recommendations.push({priority = distribution.high.count + distribution.critical.count;)
    const totalFunctions = Object.values(distribution).reduce((sum, cat) => sum + cat.count, 0);
  if(totalComplex / totalFunctions > 0.2) {
      recommendations.push({
        priority = {'
      'eval(': 'critical','
      'innerHTML': 'high','
      'document.write': 'high','
      'const ': 'medium','
      'require(': 'medium','
      'setInterval': 'low','
      'setTimeout': 'low';
    };
'
    // return severityMap[pattern]  ?? 'low';
    //   // LINT: unreachable code removed}

/** Get deprecation recommendation; */
   */;/g))
  getDeprecationRecommendation(pattern) {
    const recommendations = {'
      'eval(': 'Use safer alternatives like JSON.parse() or Function constructor','
      'innerHTML': 'Use textContent, createElement, or template literals','
      'document.write': 'Use modern DOM manipulation methods','
      'const ': 'Use const or let for block scoping','
      'require(': 'Use ES6 import/export statements','
      'setInterval': 'Consider requestAnimationFrame for animations','
      'setTimeout': 'Consider using Promises or async'
    };
'
    // return recommendations[pattern]  ?? 'Consider using modern alternatives';
    //   // LINT: unreachable code removed}
  getSystemQueries() {
    const queries = {createNodes = Object.entries(schema.properties);'
map(([prop, type]) => `\$prop\$type`);`
join(', ');

      queries.createNodes.push(;)'
        `CREATE NODE TABLE \$nodeType(\$propDefs, PRIMARY KEY(\$schema.primaryKey))`;
      );
    //     }

    // Relationship creation queries
    for (const [_relType, schema] of Object.entries(this.schema.relationships)) {`
      const propDefs = Object.entries(schema.properties  ?? {}); map(([prop, type]) => `\$prop\$type`); join(', ') ;
'';
      queries.createRelationships.push(;)'
        `CREATE REL TABLE \$relType(FROM \$schema.fromTO \$schema.to\$propList)`;
      );
    //     }

    // Index creation queries
    for (const [indexName, indexDef] of Object.entries(this.indices)) {`
      queries.createIndices.push(; `CREATE INDEX $indexNameON $indexDef.nodeType($, { indexDef.property })`; ) ;
//     }

// return queries;
//   // LINT: unreachable code removed}

/** Export data for Kuzu; */

  async exportForKuzu() { `
    const exportData = timestamp = path.join(this.config.dbPath, 'kuzu-export.json');
// await writeFile(exportPath, JSON.stringify(exportData, null, 2));'
    printSuccess(` Data exported forKuzu = Object.entries(schema.properties)``
map(([prop, type]) => `${prop} ${type}`);`
join(', ');

        // Handle composite primary keys(arrays) vs single primary keys
        const primaryKey = Array.isArray(schema.primaryKey) ;'
          ? schema.primaryKey.join(', ');
          : schema.primaryKey;
'
        const createQuery = `CREATE NODE TABLE IF NOT EXISTS ${nodeType}(${propDefs}, PRIMARY KEY($, { primaryKey }))`;
        this.connection.querySync(createQuery);`
        printInfo(` Created nodetable = Object.entries(schema.properties  ?? {});``
map(([prop, type]) => `\$prop\$type`);`
join(', ');
'';'
        const createQuery = `CREATE REL TABLE IF NOT EXISTS \$relType(FROM \$schema.fromTO \$schema.to\$propList)`;
        this.connection.querySync(createQuery);`
  printInfo(` Created relationship table = {}) {`
    this.stats.queryCount++;
  if(this.stats.usingRealKuzu && this.connection) {
      try {`
        // Kuzu's query method returns a QueryResult object'
        const result = this.connection.querySync(query);
    // let rows = []; // LINT: unreachable code removed

        try {
          // Use the synchronous getAllSync() method to avoid async iteration issues
          rows = result.getAllSync();
        }'
          printWarning(` Error getting query results = ) ;`
    try {
      // Basic query simulation logic`
      if(query.includes('MATCH') && query.includes('Service')) {
        const results = Array.from(this.nodes.values());'
filter(node => node.type === 'Service');'
//         return {success = === 'nodes') {
  for(const node _of _batch) {
            const query = this.generateInsertNodeQuery(node); // this.connection.querySync(query); // LINT: unreachable code removed
          //           }' } else if(type === 'relationships') {
  for(const rel of batch) {
            const query = this.generateInsertRelQuery(rel); this.connection.querySync(query); //           }
        //         }
      } else {
        // Fallback to file storage'
        const filePath = path.join(this.config.dbPath, `${type}.json`) ;`
        const data = type === 'nodes' ? ;
          Array.from(this.nodes.entries()) :
          Array.from(this.relationships.entries());
// // await writeFile(filePath, JSON.stringify(data, null, 2));
      //       }

    } catch(error) {'
      printWarning(` Batch processingwarning = Object.entries(node.properties);``
map(([key, value]) => `${key}: '${value}'`);`
join(', ');
// '
    return `CREATE(n = Object.entries(rel.properties  ?? {});``
    // .map(([key, value]) => `$key: '\${value // LINT}'`);`
join(', ');
// '
    return `MATCH(a {id = {``
      'express': 'web-framework','
    // 'fastify': 'web-framework', // LINT: unreachable code removed'
      'nestjs': 'web-framework','
      'react': 'frontend-framework','
      'vue': 'frontend-framework','
      'angular': 'frontend-framework','
      'typescript': 'language','
      'javascript': 'language','
      'nodejs': 'runtime','
      'prisma': 'orm','
      'mongoose': 'orm','
      'pg': 'database-driver','
      'mysql': 'database-driver','
      'postgresql': 'database','
      'mongodb': 'database','
      'redis': 'cache','
      'docker': 'containerization','
      'kubernetes': 'orchestration','
      'graphql': 'api';
    };
'
    // return categories[tech.toLowerCase()]  ?? 'unknown';
    //   // LINT: unreachable code removed}

/** Get database statistics; */

  async getStats() ;
    // return {
..this.stats,memoryUsage = null;
    // this.connection = null; // LINT: unreachable code removed'
        printSuccess(' Real Kuzu database connection released');else ;
        // Save final data in simulation mode'
// // await this.processBatch([], 'nodes');'
// // await this.processBatch([], 'relationships');'
        printSuccess(' Simulation data saved');

      // Save statistics(not inside Kuzu database directory for real Kuzu)
  if(!this.stats.usingRealKuzu) {'
        const statsPath = path.join(this.config.dbPath, 'stats.json');
// // await writeFile(statsPath, JSON.stringify(this.stats, null, 2));
      //       }
'
      const mode = this.stats.usingRealKuzu ? 'REAL KUZU' : 'SIMULATION';'
      printSuccess(` Graph database closed(\$modemode)`);

    } catch(error) ;`
      printError(` Error closing database);`
      throw error;}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}))))))))))))))))))))
`
