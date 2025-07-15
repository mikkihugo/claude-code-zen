/**
 * Test Helper Utilities
 * Common test patterns and utilities for consistent testing
 */

import { globalTestCleanup, withTimeout } from './test-cleanup.js';
import { globalPerformanceUtils } from './performance-test-utils.js';

/**
 * Enhanced sleep function that registers with cleanup
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>} Sleep promise
 */
export function sleep(ms) {
  return globalTestCleanup.sleep(ms);
}

/**
 * Wait for a condition to be true with timeout
 * @param {Function} condition - Function that returns boolean
 * @param {Object} options - Options
 * @returns {Promise<void>} Resolves when condition is true
 */
export async function waitFor(condition, options = {}) {
  const {
    timeout = 5000,
    interval = 100,
    timeoutMessage = 'Condition was not met within timeout'
  } = options;

  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await sleep(interval);
  }
  
  throw new Error(timeoutMessage);
}

/**
 * Wait for an element to exist in DOM
 * @param {string} selector - CSS selector
 * @param {Object} options - Options
 * @returns {Promise<Element>} The found element
 */
export async function waitForElement(selector, options = {}) {
  const { timeout = 5000 } = options;
  
  let element;
  await waitFor(
    () => {
      element = document.querySelector(selector);
      return element !== null;
    },
    { 
      timeout, 
      timeoutMessage: `Element "${selector}" not found within ${timeout}ms` 
    }
  );
  
  return element;
}

/**
 * Wait for multiple elements to exist in DOM
 * @param {string} selector - CSS selector
 * @param {number} count - Expected count
 * @param {Object} options - Options
 * @returns {Promise<NodeList>} The found elements
 */
export async function waitForElements(selector, count, options = {}) {
  const { timeout = 5000 } = options;
  
  let elements;
  await waitFor(
    () => {
      elements = document.querySelectorAll(selector);
      return elements.length >= count;
    },
    { 
      timeout, 
      timeoutMessage: `Expected ${count} elements "${selector}", found ${elements?.length || 0} within ${timeout}ms` 
    }
  );
  
  return elements;
}

/**
 * Create a mock function that auto-registers for cleanup
 * @param {Function} implementation - Mock implementation
 * @returns {jest.Mock} Mock function
 */
export function createMock(implementation) {
  const mock = jest.fn(implementation);
  globalTestCleanup.registerMock(mock);
  return mock;
}

/**
 * Create a spy that auto-registers for cleanup
 * @param {Object} object - Object to spy on
 * @param {string} method - Method name to spy on
 * @param {Function} implementation - Spy implementation
 * @returns {jest.SpyInstance} Spy instance
 */
export function createSpy(object, method, implementation) {
  const spy = jest.spyOn(object, method);
  if (implementation) {
    spy.mockImplementation(implementation);
  }
  globalTestCleanup.registerMock(spy);
  return spy;
}

/**
 * Mock fetch with automatic cleanup
 * @param {*} mockResponse - Response to mock
 * @param {Object} options - Mock options
 * @returns {jest.Mock} Fetch mock
 */
export function mockFetch(mockResponse, options = {}) {
  const { 
    ok = true, 
    status = 200, 
    headers = {}, 
    delay = 0 
  } = options;

  const fetchMock = createMock(async (url, config) => {
    if (delay > 0) {
      await sleep(delay);
    }
    
    return {
      ok,
      status,
      headers: new Headers(headers),
      json: async () => mockResponse,
      text: async () => typeof mockResponse === 'string' ? mockResponse : JSON.stringify(mockResponse),
      blob: async () => new Blob([JSON.stringify(mockResponse)]),
      url,
      config
    };
  });

  global.fetch = fetchMock;
  return fetchMock;
}

/**
 * Mock WebSocket with automatic cleanup
 * @param {Object} options - WebSocket mock options
 * @returns {Class} WebSocket mock class
 */
export function mockWebSocket(options = {}) {
  const {
    readyState = 1, // OPEN
    autoConnect = true,
    connectDelay = 0
  } = options;

  class MockWebSocket {
    constructor(url, protocols) {
      this.url = url;
      this.protocols = protocols;
      this.readyState = autoConnect ? readyState : 0; // CONNECTING
      this.onopen = null;
      this.onclose = null;
      this.onmessage = null;
      this.onerror = null;
      
      if (autoConnect) {
        globalTestCleanup.setTimeout(() => {
          this.readyState = readyState;
          if (this.onopen) this.onopen(new Event('open'));
        }, connectDelay);
      }
    }

    send(data) {
      if (this.readyState !== 1) {
        throw new Error('WebSocket is not open');
      }
      // Store sent data for test verification
      this.lastSentData = data;
    }

    close(code = 1000, reason = '') {
      this.readyState = 3; // CLOSED
      if (this.onclose) {
        this.onclose(new CloseEvent('close', { code, reason }));
      }
    }

    // Test helper methods
    simulateMessage(data) {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', { data }));
      }
    }

    simulateError(error) {
      if (this.onerror) {
        this.onerror(new ErrorEvent('error', { error }));
      }
    }
  }

  global.WebSocket = MockWebSocket;
  globalTestCleanup.registerMock({ restore: () => delete global.WebSocket });
  
  return MockWebSocket;
}

/**
 * Create a temporary DOM structure for testing
 * @param {string} html - HTML content
 * @returns {Element} Container element
 */
export function createTestDOM(html) {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  
  // Register for cleanup
  globalTestCleanup.registerResource(container, 'remove');
  
  return container;
}

/**
 * Simulate user events on elements
 * @param {Element} element - Target element
 * @param {string} eventType - Event type (click, input, etc.)
 * @param {Object} eventProperties - Event properties
 * @returns {Event} The dispatched event
 */
export function simulateEvent(element, eventType, eventProperties = {}) {
  const event = new Event(eventType, {
    bubbles: true,
    cancelable: true,
    ...eventProperties
  });
  
  Object.assign(event, eventProperties);
  element.dispatchEvent(event);
  
  return event;
}

/**
 * Create a test that automatically measures performance
 * @param {string} testName - Test name
 * @param {Function} testFn - Test function
 * @param {Object} performanceOptions - Performance test options
 * @returns {Function} Performance test wrapper
 */
export function performanceTest(testName, testFn, performanceOptions = {}) {
  return async () => {
    const performanceTest = globalPerformanceUtils.createPerformanceTest(
      testName,
      performanceOptions
    );
    
    const result = await performanceTest(testFn);
    
    // Log performance results if debugging is enabled
    if (process.env.DEBUG_PERFORMANCE) {
      console.log(`Performance for ${testName}:`, {
        duration: `${result.measurement.duration.toFixed(2)}ms`,
        memory: globalPerformanceUtils.formatBytes(result.measurement.memoryDelta),
        validation: result.validation
      });
    }
    
    return result;
  };
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise<*>} Function result
 */
export async function retry(fn, options = {}) {
  const {
    maxAttempts = 3,
    initialDelay = 100,
    maxDelay = 1000,
    backoffFactor = 2,
    retryCondition = () => true
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts || !retryCondition(error, attempt)) {
        throw error;
      }
      
      await sleep(Math.min(delay, maxDelay));
      delay *= backoffFactor;
    }
  }

  throw lastError;
}

/**
 * Test utilities for async operations
 */
export const AsyncTestUtils = {
  /**
   * Create a deferred promise for manual control
   * @returns {Object} Deferred promise with resolve/reject methods
   */
  createDeferred() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    
    globalTestCleanup.registerPromise(promise);
    
    return { promise, resolve, reject };
  },

  /**
   * Create a promise that resolves after a delay
   * @param {*} value - Value to resolve with
   * @param {number} delay - Delay in milliseconds
   * @returns {Promise<*>} Delayed promise
   */
  delay(value, delay) {
    return globalTestCleanup.createPromise(resolve => {
      globalTestCleanup.setTimeout(() => resolve(value), delay);
    });
  },

  /**
   * Create a promise that rejects after a delay
   * @param {Error} error - Error to reject with
   * @param {number} delay - Delay in milliseconds
   * @returns {Promise<never>} Delayed rejection
   */
  delayedReject(error, delay) {
    return globalTestCleanup.createPromise((resolve, reject) => {
      globalTestCleanup.setTimeout(() => reject(error), delay);
    });
  }
};

/**
 * Create a test suite with automatic setup and teardown
 * @param {string} suiteName - Test suite name
 * @param {Function} suiteFn - Test suite function
 * @param {Object} options - Suite options
 * @returns {void}
 */
export function testSuite(suiteName, suiteFn, options = {}) {
  const { timeout = 30000, skipSetup = false } = options;
  
  describe(suiteName, () => {
    if (!skipSetup) {
      beforeEach(() => {
        jest.setTimeout(timeout);
      });
    }
    
    suiteFn();
  });
}
