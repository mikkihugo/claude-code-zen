/**
 * @jest-environment node
 */

/**
 * Test Cleanup Utils - Basic Functionality Test
 */

describe('Test Cleanup Utils - Basic Tests', () => {
  let TestCleanup;
  let globalTestCleanup;

  beforeAll(async () => {
    // Import using dynamic import to handle ES modules
    const testCleanupModule = await import('../../utils/test-cleanup.js');
    TestCleanup = testCleanupModule.TestCleanup;
    globalTestCleanup = testCleanupModule.globalTestCleanup;
  });

  beforeEach(() => {
    // Clear any existing state
    globalTestCleanup.cleanup();
  });

  afterEach(async () => {
    await globalTestCleanup.cleanup();
  });

  test('TestCleanup class can be instantiated', () => {
    const cleanup = new TestCleanup();
    expect(cleanup).toBeInstanceOf(TestCleanup);
    expect(cleanup.timers).toBeInstanceOf(Set);
    expect(cleanup.promises).toBeInstanceOf(Set);
    expect(cleanup.intervals).toBeInstanceOf(Set);
  });

  test('setTimeout wrapper registers timer', () => {
    const cleanup = new TestCleanup();
    const timer = cleanup.setTimeout(() => {}, 100);
    
    expect(cleanup.timers.has(timer)).toBe(true);
    expect(cleanup.timers.size).toBe(1);
  });

  test('setInterval wrapper registers interval', () => {
    const cleanup = new TestCleanup();
    const interval = cleanup.setInterval(() => {}, 100);
    
    expect(cleanup.intervals.has(interval)).toBe(true);
    expect(cleanup.intervals.size).toBe(1);
  });

  test('createPromise wrapper registers promise', () => {
    const cleanup = new TestCleanup();
    const promise = cleanup.createPromise(resolve => resolve('test'));
    
    expect(cleanup.promises.has(promise)).toBe(true);
    expect(cleanup.promises.size).toBe(1);
  });

  test('cleanup clears all registered resources', async () => {
    const cleanup = new TestCleanup();
    
    // Register various resources
    cleanup.setTimeout(() => {}, 100);
    cleanup.setInterval(() => {}, 100);
    cleanup.createPromise(resolve => resolve('test'));
    cleanup.registerMock({ mockRestore: jest.fn() });
    
    // Verify resources are registered
    expect(cleanup.timers.size).toBe(1);
    expect(cleanup.intervals.size).toBe(1);
    expect(cleanup.promises.size).toBe(1);
    expect(cleanup.mocks.size).toBe(1);
    
    // Cleanup
    await cleanup.cleanup();
    
    // Verify resources are cleared
    expect(cleanup.timers.size).toBe(0);
    expect(cleanup.intervals.size).toBe(0);
    expect(cleanup.promises.size).toBe(0);
    expect(cleanup.mocks.size).toBe(0);
  });

  test('sleep function works with cleanup', async () => {
    const cleanup = new TestCleanup();
    const startTime = Date.now();
    
    await cleanup.sleep(50);
    
    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeGreaterThanOrEqual(45); // Allow some variance
    expect(elapsed).toBeLessThan(100);
  });

  test('getStats returns correct statistics', () => {
    const cleanup = new TestCleanup();
    
    cleanup.setTimeout(() => {}, 100);
    cleanup.setTimeout(() => {}, 200);
    cleanup.setInterval(() => {}, 100);
    cleanup.createPromise(resolve => resolve());
    
    const stats = cleanup.getStats();
    
    expect(stats.timers).toBe(2);
    expect(stats.intervals).toBe(1);
    expect(stats.promises).toBe(1);
    expect(stats.mocks).toBe(0);
    expect(stats.resources).toBe(0);
  });

  test('global test cleanup is available', () => {
    expect(globalTestCleanup).toBeInstanceOf(TestCleanup);
  });

  test('timeout wrapper works correctly', async () => {
    const { withTimeout } = await import('../../utils/test-cleanup.js');
    
    // Fast promise should resolve
    const fastPromise = withTimeout(
      Promise.resolve('success'),
      1000,
      'fast operation'
    );
    
    await expect(fastPromise).resolves.toBe('success');
    
    // Slow promise should timeout
    const slowPromise = withTimeout(
      new Promise(resolve => setTimeout(resolve, 200)),
      50,
      'slow operation'
    );
    
    await expect(slowPromise).rejects.toThrow('slow operation timed out after 50ms');
  });
});
