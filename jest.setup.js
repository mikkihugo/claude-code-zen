/**
 * Jest Setup File - ES Module Compatible
 * Configure test environment and global settings with enhanced cleanup
 */

// Set test environment flags
process.env.CLAUDE_FLOW_ENV = 'test';
process.env.NODE_ENV = 'test';

// Suppress console output during tests unless explicitly needed
const originalConsole = { ...console };

// Store original console for restoration
global.originalConsole = originalConsole;

// Enhanced unhandled rejection handling
process.on('unhandledRejection', (reason, promise) => {
  // Only log in test environment if needed
  if (process.env.DEBUG_TESTS) {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  if (process.env.DEBUG_TESTS) {
    console.error('Uncaught Exception:', error);
  }
});

// Simple cleanup tracking for basic use
global.testTimers = new Set();
global.testIntervals = new Set();

// Helper to clear test timers
global.clearTestTimers = () => {
  global.testTimers.forEach(timer => clearTimeout(timer));
  global.testIntervals.forEach(interval => clearInterval(interval));
  global.testTimers.clear();
  global.testIntervals.clear();
};

// Global beforeEach setup
beforeEach(() => {
  // Clear any lingering timers from previous tests
  if (typeof jest !== 'undefined') {
    jest.clearAllTimers();
  }
  
  // Clear our custom timers
  global.clearTestTimers();
});

// Global afterEach cleanup
afterEach(async () => {
  // Clear all mocks
  if (typeof jest !== 'undefined') {
    jest.clearAllMocks();
  }
  
  // Clear test timers
  global.clearTestTimers();
  
  // Reset modules if needed
  if (process.env.RESET_MODULES && typeof jest !== 'undefined') {
    jest.resetModules();
  }
  
  // Force garbage collection if available (Node.js with --expose-gc)
  if (global.gc) {
    global.gc();
  }
});

// Global setup for all tests
beforeAll(() => {
  // Set longer timeout for integration tests
  if (typeof jest !== 'undefined') {
    jest.setTimeout(30000);
  }
  
  // Mock common browser APIs if not available
  if (typeof window === 'undefined') {
    global.window = {
      addEventListener: (typeof jest !== 'undefined' && jest.fn) ? jest.fn() : () => {},
      removeEventListener: (typeof jest !== 'undefined' && jest.fn) ? jest.fn() : () => {},
      location: { href: 'http://localhost:3000' },
      document: global.document || {}
    };
  }
  
  if (typeof document === 'undefined') {
    // Simplified DOM setup for Node.js environment
    global.document = {
      createElement: (tag) => ({
        tagName: tag.toUpperCase(),
        innerHTML: '',
        textContent: '',
        className: '',
        appendChild: () => {},
        removeChild: () => {},
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {},
        removeEventListener: () => {},
        parentNode: null,
        remove: () => {}
      }),
      body: {
        appendChild: () => {},
        removeChild: () => {},
        innerHTML: '',
        querySelector: () => null,
        querySelectorAll: () => []
      },
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null
    };
    
    global.window.document = global.document;
  }
});

// Global teardown
afterAll(async () => {
  // Final cleanup
  global.clearTestTimers();
  
  // Restore console
  Object.assign(console, originalConsole);
});