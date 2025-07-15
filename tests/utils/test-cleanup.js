/**
 * Test Cleanup Utilities
 * Comprehensive cleanup patterns for async operations, timers, and resources
 * Based on analysis from issue #120 and PR #44
 */

export class TestCleanup {
  constructor() {
    this.timers = new Set();
    this.promises = new Set();
    this.intervals = new Set();
    this.listeners = new Map();
    this.mocks = new Set();
    this.resources = new Set();
  }

  /**
   * Register a timer for cleanup
   * @param {NodeJS.Timeout} timer - Timer returned by setTimeout
   * @returns {NodeJS.Timeout} The timer (for chaining)
   */
  registerTimer(timer) {
    this.timers.add(timer);
    return timer;
  }

  /**
   * Register an interval for cleanup
   * @param {NodeJS.Timeout} interval - Interval returned by setInterval
   * @returns {NodeJS.Timeout} The interval (for chaining)
   */
  registerInterval(interval) {
    this.intervals.add(interval);
    return interval;
  }

  /**
   * Register a promise for cleanup
   * @param {Promise} promise - Promise to track
   * @returns {Promise} The promise (for chaining)
   */
  registerPromise(promise) {
    this.promises.add(promise);
    // Auto-remove from set when promise resolves/rejects
    promise.finally(() => this.promises.delete(promise));
    return promise;
  }

  /**
   * Register an event listener for cleanup
   * @param {EventTarget} target - Event target
   * @param {string} event - Event name
   * @param {Function} listener - Event listener
   * @param {Object} options - Event options
   */
  registerListener(target, event, listener, options = {}) {
    const key = `${target.constructor.name}-${event}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push({ target, event, listener, options });
    target.addEventListener(event, listener, options);
  }

  /**
   * Register a mock for cleanup
   * @param {Object} mock - Jest mock or spy
   */
  registerMock(mock) {
    this.mocks.add(mock);
    return mock;
  }

  /**
   * Register a resource for cleanup (e.g., file handles, connections)
   * @param {Object} resource - Resource with cleanup method
   * @param {string} cleanupMethod - Method name to call for cleanup
   */
  registerResource(resource, cleanupMethod = 'destroy') {
    this.resources.add({ resource, cleanupMethod });
    return resource;
  }

  /**
   * Create a timeout wrapper that automatically registers for cleanup
   * @param {Function} callback - Callback function
   * @param {number} delay - Delay in milliseconds
   * @returns {NodeJS.Timeout} Timer
   */
  setTimeout(callback, delay) {
    const timer = setTimeout(callback, delay);
    return this.registerTimer(timer);
  }

  /**
   * Create an interval wrapper that automatically registers for cleanup
   * @param {Function} callback - Callback function
   * @param {number} delay - Delay in milliseconds
   * @returns {NodeJS.Timeout} Interval
   */
  setInterval(callback, delay) {
    const interval = setInterval(callback, delay);
    return this.registerInterval(interval);
  }

  /**
   * Create a promise wrapper that automatically registers for cleanup
   * @param {Function} executor - Promise executor
   * @returns {Promise} Promise
   */
  createPromise(executor) {
    const promise = new Promise(executor);
    return this.registerPromise(promise);
  }

  /**
   * Create a sleep function that registers its promise
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Sleep promise
   */
  sleep(ms) {
    return this.createPromise(resolve => {
      this.setTimeout(resolve, ms);
    });
  }

  /**
   * Clean up all registered resources
   * @returns {Promise<void>} Cleanup completion promise
   */
  async cleanup() {
    // Clear all timers
    for (const timer of this.timers) {
      clearTimeout(timer);
    }
    this.timers.clear();

    // Clear all intervals
    for (const interval of this.intervals) {
      clearInterval(interval);
    }
    this.intervals.clear();

    // Remove all event listeners
    for (const [key, listeners] of this.listeners) {
      for (const { target, event, listener, options } of listeners) {
        try {
          target.removeEventListener(event, listener, options);
        } catch (error) {
          // Ignore errors from cleanup
        }
      }
    }
    this.listeners.clear();

    // Restore all mocks
    for (const mock of this.mocks) {
      try {
        if (mock.mockRestore) {
          mock.mockRestore();
        } else if (mock.restore) {
          mock.restore();
        }
      } catch (error) {
        // Ignore errors from mock restoration
      }
    }
    this.mocks.clear();

    // Clean up resources
    for (const { resource, cleanupMethod } of this.resources) {
      try {
        if (resource && typeof resource[cleanupMethod] === 'function') {
          await resource[cleanupMethod]();
        }
      } catch (error) {
        // Ignore errors from resource cleanup
      }
    }
    this.resources.clear();

    // Wait for all pending promises (with timeout)
    if (this.promises.size > 0) {
      try {
        await Promise.race([
          Promise.allSettled([...this.promises]),
          new Promise(resolve => setTimeout(resolve, 1000)) // 1s timeout
        ]);
      } catch (error) {
        // Ignore promise cleanup errors
      }
    }
    this.promises.clear();
  }

  /**
   * Get cleanup statistics
   * @returns {Object} Cleanup stats
   */
  getStats() {
    return {
      timers: this.timers.size,
      intervals: this.intervals.size,
      promises: this.promises.size,
      listeners: Array.from(this.listeners.values()).reduce((sum, arr) => sum + arr.length, 0),
      mocks: this.mocks.size,
      resources: this.resources.size
    };
  }
}

/**
 * Global test cleanup instance for use across tests
 */
export const globalTestCleanup = new TestCleanup();

/**
 * Enhanced beforeEach hook that sets up cleanup
 * @param {TestCleanup} cleanup - Cleanup instance (optional, uses global if not provided)
 * @returns {Function} Cleanup function
 */
export function setupTestCleanup(cleanup = globalTestCleanup) {
  return () => {
    // Clear any existing state
    cleanup.cleanup();
    return cleanup;
  };
}

/**
 * Enhanced afterEach hook that performs cleanup
 * @param {TestCleanup} cleanup - Cleanup instance (optional, uses global if not provided)
 * @returns {Function} Async cleanup function
 */
export function teardownTestCleanup(cleanup = globalTestCleanup) {
  return async () => {
    await cleanup.cleanup();
  };
}

/**
 * Timeout wrapper for async operations in tests
 * @param {Promise} promise - Promise to wrap
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @param {string} operation - Operation name for error messages
 * @returns {Promise} Wrapped promise with timeout
 */
export function withTimeout(promise, timeout = 5000, operation = 'operation') {
  const timeoutPromise = new Promise((_, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${operation} timed out after ${timeout}ms`));
    }, timeout);
    globalTestCleanup.registerTimer(timer);
  });

  const wrappedPromise = Promise.race([promise, timeoutPromise]);
  globalTestCleanup.registerPromise(wrappedPromise);
  
  return wrappedPromise;
}

/**
 * Safe async wrapper that catches and logs errors
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context for error logging
 * @returns {Function} Wrapped function
 */
export function safeAsync(fn, context = 'async operation') {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.warn(`Error in ${context}:`, error.message);
      throw error;
    }
  };
}
