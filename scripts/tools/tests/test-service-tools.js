#!/usr/bin/env node;

/* Test Service Document MCP Tools Directly; */

import { ClaudeFlowMCPServer } from './src/mcp/mcp-server.js';

async function testServiceDocumentTools() {
  '
  console.warn(' Testing Service Document MCP Tools...\n')
  const server = new ClaudeFlowMCPServer()
  // await server.initializeMemory()
  // Test 1: Create a service document'
  console.warn(''
// const createResult = awaitserver.handleServiceDocumentManager({ action: 'create','
    serviceName: 'claude-zen-core','
    documentType: 'service-description','
      name: 'Claude-Flow Core Service','
      version: '2.0.0-alpha.61','
      description: 'Core orchestration service for Claude-Flow microservices','
      responsibilities: ['Service coordination', 'Memory management', 'Task orchestration']
}
)'
console.warn('Create result:', JSON.stringify(createResult, null, 2))
// Test 2: List service documents'
console.warn(''
// const listResult = awaitserver.handleServiceDocumentManager({ action: 'list','
serviceName: 'claude-zen-core','
documentType: 'service-description'
  })'
console.warn('List result:', JSON.stringify(listResult, null, 2))
// Test 3: Test service approval workflow'
console.warn(''
// const approvalResult = awaitserver.handleServiceApprovalWorkflow({ action: 'queue','
documentId: createResult.documentId  ?? 'test-doc','
approver: 'system-admin'
  })'
console.warn('Approval result:', JSON.stringify(approvalResult, null, 2))
// Test 4: Test service document validator'
console.warn(''
// const validationResult = awaitserver.handleServiceDocumentValidator({ validateType: 'single-document','
serviceName: 'claude-zen-core','
documentType: 'service-description'
  })'
console.warn('Validation result:', JSON.stringify(validationResult, null, 2))'
console.warn('\n Service Document Tools Test Complete!')
// return {
    create,
// list, // LINT: unreachable code removed
approval,
// validation
// }
// }
// Run test if called directly'
if(import.meta.url === `file) {`
  testServiceDocumentTools()
then((results) =>`
      console.warn(''
  console.warn('- Create:'' : '')'
  console.warn('- List:'' : '')'
  console.warn('- Approval:'' : '')'
  console.warn('- Validation:'' : '')
//   
catch((error) =>'
      console.error(' Test failed:', error)
  process.exit(1)
//   
// }
// export { testServiceDocumentTools };
'
