/**
 * Performance Test Utilities
 * Tools for measuring and validating performance in tests
 * Implements the missing PerformanceTestUtils mentioned in issue #120
 */

import { globalTestCleanup } from './test-cleanup.js';

export class PerformanceTestUtils {
  constructor() {
    this.measurements = new Map();
    this.thresholds = new Map();
    this.baselines = new Map();
  }

  /**
   * Start measuring an operation
   * @param {string} operationName - Name of the operation
   * @returns {string} Measurement ID
   */
  startMeasurement(operationName) {
    const measurementId = `${operationName}-${Date.now()}-${Math.random()}`;
    this.measurements.set(measurementId, {
      name: operationName,
      startTime: performance.now(),
      startMemory: this.getMemoryUsage(),
      endTime: null,
      endMemory: null,
      duration: null,
      memoryDelta: null
    });
    return measurementId;
  }

  /**
   * End measuring an operation
   * @param {string} measurementId - Measurement ID from startMeasurement
   * @returns {Object} Measurement results
   */
  endMeasurement(measurementId) {
    const measurement = this.measurements.get(measurementId);
    if (!measurement) {
      throw new Error(`Measurement ${measurementId} not found`);
    }

    measurement.endTime = performance.now();
    measurement.endMemory = this.getMemoryUsage();
    measurement.duration = measurement.endTime - measurement.startTime;
    measurement.memoryDelta = measurement.endMemory - measurement.startMemory;

    return {
      name: measurement.name,
      duration: measurement.duration,
      memoryDelta: measurement.memoryDelta,
      startMemory: measurement.startMemory,
      endMemory: measurement.endMemory
    };
  }

  /**
   * Measure an async operation
   * @param {string} operationName - Name of the operation
   * @param {Function} operation - Async operation to measure
   * @returns {Promise<Object>} Measurement results with operation result
   */
  async measureAsync(operationName, operation) {
    const measurementId = this.startMeasurement(operationName);
    
    try {
      const result = await operation();
      const measurement = this.endMeasurement(measurementId);
      
      return {
        result,
        performance: measurement
      };
    } catch (error) {
      // End measurement even on error
      this.endMeasurement(measurementId);
      throw error;
    } finally {
      this.measurements.delete(measurementId);
    }
  }

  /**
   * Measure a synchronous operation
   * @param {string} operationName - Name of the operation
   * @param {Function} operation - Synchronous operation to measure
   * @returns {Object} Measurement results with operation result
   */
  measureSync(operationName, operation) {
    const measurementId = this.startMeasurement(operationName);
    
    try {
      const result = operation();
      const measurement = this.endMeasurement(measurementId);
      
      return {
        result,
        performance: measurement
      };
    } finally {
      this.measurements.delete(measurementId);
    }
  }

  /**
   * Set performance threshold for an operation
   * @param {string} operationName - Name of the operation
   * @param {Object} thresholds - Threshold values
   */
  setThreshold(operationName, thresholds) {
    this.thresholds.set(operationName, {
      maxDuration: thresholds.maxDuration || Infinity,
      maxMemoryIncrease: thresholds.maxMemoryIncrease || Infinity,
      minDuration: thresholds.minDuration || 0,
      ...thresholds
    });
  }

  /**
   * Validate measurement against thresholds
   * @param {Object} measurement - Measurement result
   * @returns {Object} Validation result
   */
  validatePerformance(measurement) {
    const threshold = this.thresholds.get(measurement.name);
    if (!threshold) {
      return { valid: true, warnings: [], errors: [] };
    }

    const warnings = [];
    const errors = [];

    if (measurement.duration > threshold.maxDuration) {
      errors.push(`Duration ${measurement.duration.toFixed(2)}ms exceeds threshold ${threshold.maxDuration}ms`);
    }

    if (measurement.duration < threshold.minDuration) {
      warnings.push(`Duration ${measurement.duration.toFixed(2)}ms is below minimum ${threshold.minDuration}ms`);
    }

    if (measurement.memoryDelta > threshold.maxMemoryIncrease) {
      errors.push(`Memory increase ${this.formatBytes(measurement.memoryDelta)} exceeds threshold ${this.formatBytes(threshold.maxMemoryIncrease)}`);
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors
    };
  }

  /**
   * Set performance baseline for comparison
   * @param {string} operationName - Name of the operation
   * @param {Object} baseline - Baseline measurement
   */
  setBaseline(operationName, baseline) {
    this.baselines.set(operationName, baseline);
  }

  /**
   * Compare measurement against baseline
   * @param {Object} measurement - Current measurement
   * @returns {Object} Comparison result
   */
  compareToBaseline(measurement) {
    const baseline = this.baselines.get(measurement.name);
    if (!baseline) {
      return { hasBaseline: false };
    }

    const durationRatio = measurement.duration / baseline.duration;
    const memoryRatio = baseline.memoryDelta !== 0 ? 
      measurement.memoryDelta / baseline.memoryDelta : 1;

    return {
      hasBaseline: true,
      durationChange: ((durationRatio - 1) * 100).toFixed(2),
      memoryChange: ((memoryRatio - 1) * 100).toFixed(2),
      fasterThanBaseline: durationRatio < 1,
      memoryEfficient: memoryRatio <= 1,
      baseline,
      current: measurement
    };
  }

  /**
   * Get current memory usage
   * @returns {number} Memory usage in bytes
   */
  getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    } else if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Format bytes for human-readable output
   * @param {number} bytes - Bytes to format
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  /**
   * Create a performance test wrapper
   * @param {string} operationName - Name of the operation
   * @param {Object} options - Performance test options
   * @returns {Function} Test wrapper function
   */
  createPerformanceTest(operationName, options = {}) {
    const {
      threshold = {},
      baseline = null,
      warmupRuns = 0,
      measurementRuns = 1,
      expectValid = true
    } = options;

    if (Object.keys(threshold).length > 0) {
      this.setThreshold(operationName, threshold);
    }

    if (baseline) {
      this.setBaseline(operationName, baseline);
    }

    return async (testOperation) => {
      const results = [];

      // Warmup runs
      for (let i = 0; i < warmupRuns; i++) {
        await testOperation();
      }

      // Measurement runs
      for (let i = 0; i < measurementRuns; i++) {
        const { result, performance: measurement } = await this.measureAsync(
          operationName,
          testOperation
        );

        const validation = this.validatePerformance(measurement);
        const comparison = this.compareToBaseline(measurement);

        results.push({
          result,
          measurement,
          validation,
          comparison
        });

        // Fail fast if expectValid is true and validation fails
        if (expectValid && !validation.valid) {
          throw new Error(`Performance test failed for ${operationName}: ${validation.errors.join(', ')}`);
        }
      }

      return results.length === 1 ? results[0] : results;
    };
  }

  /**
   * Create a load test for measuring performance under load
   * @param {string} operationName - Name of the operation
   * @param {Object} options - Load test options
   * @returns {Function} Load test function
   */
  createLoadTest(operationName, options = {}) {
    const {
      concurrency = 1,
      duration = 1000,
      rampUp = 0,
      threshold = {}
    } = options;

    if (Object.keys(threshold).length > 0) {
      this.setThreshold(operationName, threshold);
    }

    return async (testOperation) => {
      const results = [];
      const startTime = performance.now();
      const endTime = startTime + duration;
      const rampUpIncrement = rampUp > 0 ? duration / rampUp : 0;

      let currentConcurrency = rampUp > 0 ? 1 : concurrency;
      let lastRampUpTime = startTime;

      while (performance.now() < endTime) {
        // Ramp up concurrency gradually
        if (rampUp > 0 && performance.now() - lastRampUpTime > rampUpIncrement) {
          currentConcurrency = Math.min(currentConcurrency + 1, concurrency);
          lastRampUpTime = performance.now();
        }

        // Execute operations concurrently
        const promises = Array(currentConcurrency).fill().map(async () => {
          const { result, performance: measurement } = await this.measureAsync(
            `${operationName}-load`,
            testOperation
          );
          return { result, measurement };
        });

        const batchResults = await Promise.allSettled(promises);
        results.push(...batchResults.filter(r => r.status === 'fulfilled').map(r => r.value));

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => {
          globalTestCleanup.setTimeout(resolve, 10);
        });
      }

      // Calculate aggregate statistics
      const durations = results.map(r => r.measurement.duration);
      const memoryDeltas = results.map(r => r.measurement.memoryDelta);

      return {
        totalOperations: results.length,
        averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        medianDuration: this.calculateMedian(durations),
        averageMemoryDelta: memoryDeltas.reduce((sum, d) => sum + d, 0) / memoryDeltas.length,
        operationsPerSecond: results.length / (duration / 1000),
        results
      };
    };
  }

  /**
   * Calculate median of an array
   * @param {number[]} values - Array of numbers
   * @returns {number} Median value
   */
  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  /**
   * Clean up all measurements and thresholds
   */
  cleanup() {
    this.measurements.clear();
    this.thresholds.clear();
    this.baselines.clear();
  }
}

/**
 * Global performance test utilities instance
 */
export const globalPerformanceUtils = new PerformanceTestUtils();

/**
 * Quick performance measurement function
 * @param {string} name - Operation name
 * @param {Function} operation - Operation to measure
 * @returns {Promise<Object>} Measurement result
 */
export async function measurePerformance(name, operation) {
  return await globalPerformanceUtils.measureAsync(name, operation);
}

/**
 * Assert that an operation meets performance requirements
 * @param {string} name - Operation name
 * @param {Function} operation - Operation to test
 * @param {Object} requirements - Performance requirements
 * @returns {Promise<Object>} Test result
 */
export async function expectPerformance(name, operation, requirements) {
  globalPerformanceUtils.setThreshold(name, requirements);
  
  const { result, performance: measurement } = await globalPerformanceUtils.measureAsync(name, operation);
  const validation = globalPerformanceUtils.validatePerformance(measurement);
  
  if (!validation.valid) {
    throw new Error(`Performance requirements not met: ${validation.errors.join(', ')}`);
  }
  
  return { result, measurement, validation };
}
