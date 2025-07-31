/**
 * @fileoverview
 * Performance benchmark for MCP stdio optimizations
 */

/** Compares performance before and after optimizations */

import { MCPErrorHandler } from './src/mcp/core/error-handler.js';
import { PerformanceMetrics } from './src/mcp/core/performance-metrics.js';
import { StdioOptimizer } from './src/mcp/core/stdio-optimizer.js';

class StdioBenchmark {
  constructor() {
    this.config = {
      messageCount: 1000,
      batchSize: 50,
      maxRetries: 3,
      retryDelay: 100,
      errorRate: 0.05,
    };
  }

  /** Generate test messages for benchmarking */
  generateTestMessages(count) {
    const messages = [];
    for (let i = 0; i < count; i++) {
      messages.push({
        id: i,
        type: 'test',
        payload: `Test message ${i}`,
        timestamp: Date.now(),
      });
    }
    return messages;
  }

  /** Simulate processing delay */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Test baseline message processing without optimizations */
  async runBaselineTest() {
    console.warn('Running baseline test...');

    const messageCount = this.config.messageCount;
    const messages = this.generateTestMessages(messageCount);
    const startTime = Date.now();
    let processedCount = 0;
    let errorCount = 0;

    // Simulate individual message processing (no batching)
    for (const message of messages) {
      try {
        // Simulate processing time
        await this.delay(Math.random() * 2);
        // Simulate error rate
        if (Math.random() < this.config.errorRate) {
          throw new Error('Simulated processing error');
        }
        processedCount++;
      } catch (error) {
        console.error('Processing error:', error.message);
        errorCount++;
        // No retry logic in baseline
      }
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    return {
      messageCount,
      processedCount,
      errorCount,
      totalTime,
      throughput: (processedCount / totalTime) * 1000, // messages per second
      errorRate: errorCount / messageCount,
      avgLatency: totalTime / messageCount,
    };
  }

  /** Test optimized message processing with batching and error handling */
  async runOptimizedTest() {
    console.warn('Running optimized test...');

    const messageCount = this.config.messageCount;
    const messages = this.generateTestMessages(messageCount);
    const errorHandler = new MCPErrorHandler({
      maxRetries: this.config.maxRetries,
      retryDelay: this.config.retryDelay,
    });
    const performanceMetrics = new PerformanceMetrics({ enableLogging: false });
    const startTime = Date.now();
    let processedCount = 0;
    let errorCount = 0;
    let batchCount = 0;

    // Setup batch processing
    const stdioOptimizer = new StdioOptimizer({
      batchSize: this.config.batchSize,
      flushInterval: 10,
    });

    stdioOptimizer.on('batch', async (batch) => {
      batchCount++;
      for (const item of batch) {
        const requestId = `req-${item.message.id}`;
        performanceMetrics.recordRequestStart(requestId);

        try {
          // Use error handler with retry logic
          await errorHandler.executeWithRetry(async () => {
            // Simulate processing time
            await this.delay(Math.random() * 2);
            // Simulate error rate
            if (Math.random() < this.config.errorRate) {
              throw new Error('Simulated processing error');
            }
            return { success: true };
          });

          processedCount++;
          performanceMetrics.recordRequestEnd(requestId, true);
        } catch (error) {
          console.error('Processing error after retries:', error.message);
          errorCount++;
          performanceMetrics.recordRequestEnd(requestId, false);
        }
      }
    });

    // Process all messages through optimizer
    for (const message of messages) {
      stdioOptimizer.addMessage(message);
    }

    // Wait for final batch to complete
    await stdioOptimizer.flush();

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    return {
      messageCount,
      processedCount,
      errorCount,
      totalTime,
      batchCount,
      throughput: (processedCount / totalTime) * 1000,
      errorRate: errorCount / messageCount,
      avgLatency: totalTime / messageCount,
      avgBatchSize: messageCount / batchCount,
    };
  }

  /** Run comprehensive benchmark comparison */
  async runBenchmark() {
    console.warn('🚀 Starting MCP Stdio Benchmark');
    console.warn('='.repeat(50));

    try {
      // Run baseline test
      const baseline = await this.runBaselineTest();

      // Run optimized test
      const optimized = await this.runOptimizedTest();

      // Calculate improvements
      const throughputImprovement = ((optimized.throughput - baseline.throughput) / baseline.throughput) * 100;
      const errorReduction = ((baseline.errorRate - optimized.errorRate) / baseline.errorRate) * 100;
      const latencyImprovement = ((baseline.avgLatency - optimized.avgLatency) / baseline.avgLatency) * 100;

      // Display results
      console.warn('\n📊 BENCHMARK RESULTS');
      console.warn('='.repeat(50));

      console.warn('\n🔧 THROUGHPUT:');
      console.warn(`  Baseline:  ${baseline.throughput.toFixed(2)} msg/sec`);
      console.warn(`  Optimized: ${optimized.throughput.toFixed(2)} msg/sec`);
      console.warn(`  Improvement: ${throughputImprovement.toFixed(1)}%`);

      console.warn('\n📈 SUCCESS RATE:');
      const baselineSuccessRate = (baseline.processedCount / baseline.messageCount) * 100;
      const optimizedSuccessRate = (optimized.processedCount / optimized.messageCount) * 100;
      console.warn(`  Baseline:  ${baselineSuccessRate.toFixed(1)}% (${baseline.processedCount}/${baseline.messageCount})`);
      console.warn(`  Optimized: ${optimizedSuccessRate.toFixed(1)}% (${optimized.processedCount}/${optimized.messageCount})`);
      console.warn(`  Error Reduction: ${errorReduction.toFixed(1)}%`);

      console.warn('\n⚡ LATENCY:');
      console.warn(`  Baseline:  ${baseline.avgLatency.toFixed(2)}ms/msg`);
      console.warn(`  Optimized: ${optimized.avgLatency.toFixed(2)}ms/msg`);
      console.warn(`  Improvement: ${latencyImprovement.toFixed(1)}%`);

      console.warn('\n📦 BATCHING:');
      console.warn(`  Batch Count: ${optimized.batchCount}`);
      console.warn(`  Avg Batch Size: ${optimized.avgBatchSize.toFixed(1)} messages`);
      console.warn(`  Batching Efficiency: ${((optimized.messageCount / optimized.batchCount) / this.config.batchSize * 100).toFixed(1)}%`);

      console.warn('\n' + '='.repeat(50));
      console.warn('✅ Benchmark completed successfully!');

      return {
        baseline,
        optimized,
        improvements: {
          throughput: throughputImprovement,
          errorReduction,
          latency: latencyImprovement,
        },
      };

    } catch (error) {
      console.error('❌ Benchmark failed:', error);
      throw error;
    }
  }
}

// Execute benchmark if run directly
if (import.meta.url === 'file://' + process.argv[1]) {
  const benchmark = new StdioBenchmark();
  benchmark.runBenchmark().catch(console.error);
}

export default StdioBenchmark;
