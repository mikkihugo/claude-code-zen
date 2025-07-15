/**
 * Test Utils Index
 * Central export point for all test utilities
 */

// Core cleanup utilities
export {
  TestCleanup,
  globalTestCleanup,
  setupTestCleanup,
  teardownTestCleanup,
  withTimeout,
  safeAsync
} from './test-cleanup.js';

// Performance testing utilities
export {
  PerformanceTestUtils,
  globalPerformanceUtils,
  measurePerformance,
  expectPerformance
} from './performance-test-utils.js';

// Test helper utilities
export {
  sleep,
  waitFor,
  waitForElement,
  waitForElements,
  createMock,
  createSpy,
  mockFetch,
  mockWebSocket,
  createTestDOM,
  simulateEvent,
  performanceTest,
  retry,
  AsyncTestUtils,
  testSuite
} from './test-helpers.js';

// Convenience re-exports for common patterns
export const TestUtils = {
  // Cleanup
  cleanup: globalTestCleanup,
  setupCleanup: setupTestCleanup,
  teardownCleanup: teardownTestCleanup,
  timeout: withTimeout,
  
  // Performance
  performance: globalPerformanceUtils,
  measure: measurePerformance,
  expectPerf: expectPerformance,
  
  // Helpers
  sleep,
  wait: waitFor,
  waitElement: waitForElement,
  mock: createMock,
  spy: createSpy,
  dom: createTestDOM,
  event: simulateEvent,
  retry,
  
  // Async utilities
  async: AsyncTestUtils,
  
  // Suite setup
  suite: testSuite
};

// Default export
export default TestUtils;
