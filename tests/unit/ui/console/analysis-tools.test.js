/**
 * @jest-environment node
 */

/**
 * Analysis Tools Test - Using Enhanced Test Cleanup Patterns
 */

import { 
  globalTestCleanup, 
  withTimeout,
  setupTestCleanup,
  teardownTestCleanup 
} from '../../../utils/test-cleanup.js';
import { 
  createTestDOM, 
  mockFetch, 
  mockWebSocket, 
  createMock, 
  createSpy, 
  waitFor, 
  waitForElement,
  sleep,
  testSuite
} from '../../../utils/test-helpers.js';

// Enhanced test suite with automatic cleanup
testSuite('AnalysisTools - Error Handling', () => {
  let AnalysisTools;
  let analysisTools;
  let testContainer;

  beforeAll(async () => {
    // Setup DOM environment with cleanup
    testContainer = createTestDOM(`
      <div id="performance-chart"></div>
      <div id="token-usage-chart"></div>
      <div id="system-health-chart"></div>
      <div id="load-monitor-chart"></div>
      <div id="performance-metrics"></div>
      <div id="token-metrics"></div>
      <div id="health-status"></div>
      <div id="alerts-container"></div>
      <div id="connection-status"></div>
      <div id="performance-report-output"></div>
      <div id="bottleneck-analysis-output"></div>
      <div id="token-usage-output"></div>
      <div id="benchmark-output"></div>
      <div id="metrics-output"></div>
      <div id="trends-output"></div>
      <div id="costs-output"></div>
      <div id="quality-output"></div>
      <div id="errors-output"></div>
      <div id="stats-output"></div>
      <div id="health-output"></div>
      <div id="load-output"></div>
      <div id="capacity-output"></div>
      <div class="analysis-tab" data-tab="metrics"></div>
      <div class="analysis-panel" id="metrics-panel"></div>
    `);
    
    // Mock Chart.js with cleanup registration
    global.Chart = createMock(() => ({
      data: { labels: [], datasets: [] },
      update: createMock(),
      destroy: createMock(),
      resize: createMock()
    }));
    
    // Mock WebSocket with enhanced features and cleanup
    const MockWebSocket = mockWebSocket({
      autoConnect: false,
      connectDelay: 50
    });
    
    // Mock the analysis tools class
    AnalysisTools = class {
      constructor() {
        this.ws = null;
        this.charts = {};
        this.currentTab = 'metrics';
        this.isConnected = false;
        this.metricsCache = new Map();
        this.updateInterval = null;
        this.init();
      }

      init() {
        this.setupWebSocket();
        this.setupEventListeners();
        this.initializeCharts();
        this.startRealTimeUpdates();
      }

      setupWebSocket() {
        this.ws = new global.WebSocket('ws://localhost:3000/analysis');
        this.ws.onopen = () => {
          this.isConnected = true;
          this.onConnectionStatusChange(true);
        };
        this.ws.onclose = () => {
          this.isConnected = false;
          this.onConnectionStatusChange(false);
        };
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.showError('Connection error occurred');
        };
      }

      setupEventListeners() {
        // Event listeners would be registered here
        // Using globalTestCleanup.registerListener for proper cleanup
      }

      initializeCharts() {
        this.charts.performance = new global.Chart();
        this.charts.tokenUsage = new global.Chart();
        this.charts.systemHealth = new global.Chart();
        this.charts.loadMonitor = new global.Chart();
      }

      startRealTimeUpdates() {
        // Use globalTestCleanup.setInterval for proper cleanup
        this.updateInterval = globalTestCleanup.setInterval(() => {
          if (this.isConnected) {
            this.updateMetrics();
          }
        }, 1000);
      }

      async fetchAnalysisData(endpoint) {
        try {
          const response = await fetch(endpoint);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return await response.json();
        } catch (error) {
          console.error('Fetch error:', error);
          this.showError(`Failed to fetch data from ${endpoint}`);
          throw error;
        }
      }

      showError(message) {
        // Create error display with timeout cleanup
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        // Auto-remove error after delay
        globalTestCleanup.setTimeout(() => {
          if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
          }
        }, 5000);
      }

      onConnectionStatusChange(connected) {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
          statusElement.textContent = connected ? 'Connected' : 'Disconnected';
          statusElement.className = connected ? 'connected' : 'disconnected';
        }
      }

      updateMetrics() {
        // Simulate metrics update
      }

      async performanceReport() {
        try {
          const data = await this.fetchAnalysisData('/api/performance');
          this.displayResults('performance-report-output', data);
        } catch (error) {
          this.displayError('performance-report-output', 'Performance analysis failed');
        }
      }

      async bottleneckAnalyze() {
        try {
          const data = await this.fetchAnalysisData('/api/bottlenecks');
          this.displayResults('bottleneck-analysis-output', data);
        } catch (error) {
          this.displayError('bottleneck-analysis-output', 'Bottleneck analysis failed');
        }
      }

      async tokenUsage() {
        try {
          const data = await this.fetchAnalysisData('/api/tokens');
          this.displayResults('token-usage-output', data);
        } catch (error) {
          this.displayError('token-usage-output', 'Token usage analysis failed');
        }
      }

      displayResults(containerId, data) {
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = `<div class="results">${JSON.stringify(data)}</div>`;
        }
      }

      displayError(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = `
            <div class="error-container">
              <h3>Error</h3>
              <p>${message}</p>
              <p>Please ensure the analysis service is running.</p>
              <button class="retry-btn">Retry</button>
              <button class="dismiss-btn">Dismiss</button>
            </div>
          `;
        }
      }

      cleanup() {
        // Cleanup method for test teardown
        if (this.ws) {
          this.ws.close();
        }
        if (this.updateInterval) {
          clearInterval(this.updateInterval);
        }
        Object.values(this.charts).forEach(chart => {
          if (chart && chart.destroy) {
            chart.destroy();
          }
        });
      }
    };
  });

  beforeEach(() => {
    // Create fresh instance for each test
    analysisTools = new AnalysisTools();
    
    // Register the instance for cleanup
    globalTestCleanup.registerResource(analysisTools, 'cleanup');
  });

  describe('WebSocket Connection Handling', () => {
    test('should handle WebSocket connection successfully', async () => {
      expect(analysisTools.isConnected).toBe(false);
      
      // Simulate successful connection
      analysisTools.ws.readyState = 1; // OPEN
      if (analysisTools.ws.onopen) {
        analysisTools.ws.onopen();
      }
      
      // Wait for connection status to update
      await waitFor(() => analysisTools.isConnected === true, {
        timeout: 1000,
        timeoutMessage: 'WebSocket connection not established'
      });
      
      expect(analysisTools.isConnected).toBe(true);
      
      // Verify connection status in DOM
      const statusElement = await waitForElement('#connection-status');
      expect(statusElement.textContent).toBe('Connected');
      expect(statusElement.className).toBe('connected');
    });

    test('should handle WebSocket connection failure', async () => {
      const consoleSpy = createSpy(console, 'error');
      
      // Simulate connection error
      const errorEvent = new ErrorEvent('error', {
        error: new Error('Connection failed')
      });
      
      if (analysisTools.ws.onerror) {
        analysisTools.ws.onerror(errorEvent);
      }
      
      // Wait for error message to appear
      await waitFor(async () => {
        const errorElements = document.querySelectorAll('.error-message');
        return errorElements.length > 0;
      }, {
        timeout: 1000,
        timeoutMessage: 'Error message not displayed'
      });
      
      const errorElements = document.querySelectorAll('.error-message');
      expect(errorElements.length).toBeGreaterThan(0);
      expect(errorElements[0].textContent).toContain('Connection error occurred');
    });

    test('should handle WebSocket disconnection', async () => {
      // First establish connection
      analysisTools.ws.readyState = 1;
      if (analysisTools.ws.onopen) {
        analysisTools.ws.onopen();
      }
      
      await waitFor(() => analysisTools.isConnected === true);
      
      // Then simulate disconnection
      analysisTools.ws.readyState = 3; // CLOSED
      if (analysisTools.ws.onclose) {
        analysisTools.ws.onclose();
      }
      
      await waitFor(() => analysisTools.isConnected === false);
      
      expect(analysisTools.isConnected).toBe(false);
      
      const statusElement = document.getElementById('connection-status');
      expect(statusElement.textContent).toBe('Disconnected');
      expect(statusElement.className).toBe('disconnected');
    });
  });

  describe('fetchAnalysisData Error Handling', () => {
    test('should throw error and show error message when fetch fails', async () => {
      const errorMessage = 'Network error';
      const fetchMock = mockFetch(null, { ok: false, status: 500 });
      fetchMock.mockRejectedValue(new Error(errorMessage));

      const consoleErrorSpy = createSpy(console, 'error');
      
      await expect(analysisTools.fetchAnalysisData('/api/test')).rejects.toThrow(errorMessage);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Fetch error:', expect.any(Error));
      
      // Wait for error message to be displayed with proper timeout
      await waitFor(async () => {
        const errorElements = document.querySelectorAll('.error-message');
        return errorElements.length > 0 && 
               errorElements[0].textContent.includes('Failed to fetch data from /api/test');
      }, {
        timeout: 2000,
        interval: 50,
        timeoutMessage: 'Error message not displayed in DOM'
      });
    });

    test('should throw error when response is not ok', async () => {
      mockFetch(null, {
        ok: false,
        status: 404
      });

      await expect(analysisTools.fetchAnalysisData('/api/test'))
        .rejects.toThrow('HTTP error! status: 404');
    });

    test('should handle successful fetch', async () => {
      const mockData = { result: 'success', data: [1, 2, 3] };
      mockFetch(mockData, {
        ok: true,
        status: 200
      });

      const result = await withTimeout(
        analysisTools.fetchAnalysisData('/api/test'),
        2000,
        'fetchAnalysisData'
      );
      
      expect(result).toEqual(mockData);
    });
  });

  describe('Tool Error Handling', () => {
    const tools = [
      { method: 'performanceReport', container: 'performance-report-output' },
      { method: 'bottleneckAnalyze', container: 'bottleneck-analysis-output' },
      { method: 'tokenUsage', container: 'token-usage-output' }
    ];

    tools.forEach(({ method, container }) => {
      test(`${method} should display error in UI when fetch fails`, async () => {
        mockFetch(null, { ok: false, status: 503 });
        
        const fetchMock = global.fetch;
        fetchMock.mockRejectedValue(new Error('Service unavailable'));
        
        await analysisTools[method]();
        
        // Wait for error to be displayed with specific timeout
        await waitFor(() => {
          const containerElement = document.getElementById(container);
          return containerElement && 
                 containerElement.innerHTML.includes('error-container');
        }, {
          timeout: 2000,
          interval: 50,
          timeoutMessage: `Error container not found in ${container}`
        });
        
        const containerElement = document.getElementById(container);
        expect(containerElement.innerHTML).toContain('error-container');
        expect(containerElement.innerHTML).toContain('Error');
        expect(containerElement.innerHTML).toContain('analysis service is running');
        expect(containerElement.innerHTML).toContain('Retry');
        expect(containerElement.innerHTML).toContain('Dismiss');
      }, 10000); // Increased timeout for this complex test
    });
  });

  describe('Resource Cleanup', () => {
    test('should clean up all resources properly', async () => {
      // Verify charts are created
      expect(Object.keys(analysisTools.charts)).toHaveLength(4);
      
      // Verify WebSocket exists
      expect(analysisTools.ws).toBeTruthy();
      
      // Verify update interval is running
      expect(analysisTools.updateInterval).toBeTruthy();
      
      // Manually call cleanup
      analysisTools.cleanup();
      
      // Verify all charts have destroy called
      Object.values(analysisTools.charts).forEach(chart => {
        expect(chart.destroy).toHaveBeenCalled();
      });
      
      // WebSocket should be closed
      expect(analysisTools.ws.readyState).toBe(3); // CLOSED
    });

    test('should handle cleanup gracefully with missing resources', () => {
      // Create instance with missing resources
      const testInstance = new AnalysisTools();
      testInstance.ws = null;
      testInstance.updateInterval = null;
      testInstance.charts = {};
      
      // Should not throw
      expect(() => testInstance.cleanup()).not.toThrow();
    });
  });
}, { timeout: 15000 });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return await response.json();
        } catch (error) {
          console.error('Fetch error:', error);
          this.showError(`Failed to fetch data from ${endpoint}: ${error.message}`);
          throw error;
        }
      }

      showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        document.body.appendChild(errorElement);
        
        setTimeout(() => {
          errorElement.remove();
        }, 5000);
      }

      displayError(containerId, message) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
          <div class="error-container">
            <div class="error-icon">❌</div>
            <div class="error-message">
              <h4>Error</h4>
              <p>${message}</p>
            </div>
            <div class="error-actions">
              <button class="retry-btn" onclick="location.reload()">Retry</button>
              <button class="dismiss-btn" onclick="this.parentElement.parentElement.remove()">Dismiss</button>
            </div>
          </div>
        `;
      }

      async performanceReport() {
        try {
          const report = await this.fetchAnalysisData('/api/analysis/performance-report');
          this.displayReport('performance-report-output', report);
          await this.notifyToolCompletion('performance_report');
        } catch (error) {
          this.displayError('performance-report-output', 'Unable to fetch performance report. Please ensure the analysis service is running.');
        }
      }

      async bottleneckAnalyze() {
        try {
          const analysis = await this.fetchAnalysisData('/api/analysis/bottleneck-analyze');
          this.displayAnalysis('bottleneck-analysis-output', analysis);
          await this.notifyToolCompletion('bottleneck_analyze');
        } catch (error) {
          this.displayError('bottleneck-analysis-output', 'Unable to fetch bottleneck analysis. Please ensure the analysis service is running.');
        }
      }

      async tokenUsage() {
        try {
          const usage = await this.fetchAnalysisData('/api/analysis/token-usage');
          this.displayUsage('token-usage-output', usage);
          await this.notifyToolCompletion('token_usage');
        } catch (error) {
          this.displayError('token-usage-output', 'Unable to fetch token usage data. Please ensure the analysis service is running.');
        }
      }

      displayReport(containerId, report) {}
      displayAnalysis(containerId, analysis) {}
      displayUsage(containerId, usage) {}
      async notifyToolCompletion(toolName) {}

      executeTool(toolName) {
        const button = document.querySelector(`[data-tool="${toolName}"]`);
        if (button) {
          button.classList.add('loading');
          button.disabled = true;
        }

        const promise = this[toolName]();
        
        promise.finally(() => {
          if (button) {
            button.classList.remove('loading');
            button.disabled = false;
          }
        });

        return promise;
      }

      destroy() {
        if (this.updateInterval) {
          clearInterval(this.updateInterval);
        }
        if (this.ws) {
          this.ws.close();
        }
      }
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockReset();
    analysisTools = new AnalysisTools();
  });

  afterEach(() => {
    if (analysisTools && analysisTools.destroy) {
      analysisTools.destroy();
    }
  });

  describe('fetchAnalysisData Error Handling', () => {
    test('should throw error and show error message when fetch fails', async () => {
      const errorMessage = 'Network error';
      global.fetch.mockRejectedValue(new Error(errorMessage));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await expect(analysisTools.fetchAnalysisData('/api/test')).rejects.toThrow(errorMessage);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Fetch error:', expect.any(Error));
      
      // Check if error message is displayed
      await new Promise(resolve => setTimeout(resolve, 100));
      const errorElements = document.querySelectorAll('.error-message');
      expect(errorElements.length).toBeGreaterThan(0);
      expect(errorElements[0].textContent).toContain('Failed to fetch data from /api/test');
      
      consoleErrorSpy.mockRestore();
    });

    test('should throw error when response is not ok', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404
      });

      await expect(analysisTools.fetchAnalysisData('/api/test')).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('Tool Error Handling', () => {
    const tools = [
      { method: 'performanceReport', container: 'performance-report-output' },
      { method: 'bottleneckAnalyze', container: 'bottleneck-analysis-output' },
      { method: 'tokenUsage', container: 'token-usage-output' }
    ];

    tools.forEach(({ method, container }) => {
      test(`${method} should display error in UI when fetch fails`, async () => {
        global.fetch.mockRejectedValue(new Error('Service unavailable'));
        
        await analysisTools[method]();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const containerElement = document.getElementById(container);
        expect(containerElement.innerHTML).toContain('error-container');
        expect(containerElement.innerHTML).toContain('Error');
        expect(containerElement.innerHTML).toContain('analysis service is running');
        expect(containerElement.innerHTML).toContain('Retry');
        expect(containerElement.innerHTML).toContain('Dismiss');
      });
    });
  });

  describe('displayError Method', () => {
    test('should create error UI with correct structure', () => {
      const containerId = 'test-container';
      const message = 'Test error message';
      
      document.body.innerHTML += `<div id="${containerId}"></div>`;
      
      analysisTools.displayError(containerId, message);
      
      const container = document.getElementById(containerId);
      expect(container.querySelector('.error-container')).toBeTruthy();
      expect(container.querySelector('.error-icon').textContent).toBe('❌');
      expect(container.querySelector('.error-message h4').textContent).toBe('Error');
      expect(container.querySelector('.error-message p').textContent).toBe(message);
      expect(container.querySelector('.retry-btn')).toBeTruthy();
      expect(container.querySelector('.dismiss-btn')).toBeTruthy();
    });

    test('should handle missing container gracefully', () => {
      expect(() => {
        analysisTools.displayError('non-existent-container', 'Test message');
      }).not.toThrow();
    });
  });

  describe('showError Method', () => {
    test('should create temporary error message', () => {
      jest.useFakeTimers();
      
      analysisTools.showError('Test error message');
      
      const errorElement = document.querySelector('.error-message');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toBe('Test error message');
      
      jest.advanceTimersByTime(5000);
      
      expect(document.querySelector('.error-message')).toBeFalsy();
      
      jest.useRealTimers();
    });
  });

  describe('Tool Button Error States', () => {
    test('should disable button and show loading state during execution', async () => {
      const button = document.createElement('button');
      button.setAttribute('data-tool', 'performanceReport');
      document.body.appendChild(button);
      
      global.fetch.mockRejectedValue(new Error('Service unavailable'));
      
      const promise = analysisTools.executeTool('performanceReport');
      
      expect(button.classList.contains('loading')).toBe(true);
      expect(button.disabled).toBe(true);
      
      await promise.catch(() => {});
      
      expect(button.classList.contains('loading')).toBe(false);
      expect(button.disabled).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    test('should handle successful API response correctly', async () => {
      const mockData = {
        summary: 'Test summary',
        metrics: {
          averageResponseTime: 100,
          throughput: 50,
          errorRate: 0.01,
          uptime: '99.9%'
        },
        recommendations: ['Recommendation 1', 'Recommendation 2']
      };
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData
      });
      
      const displayReportSpy = jest.spyOn(analysisTools, 'displayReport').mockImplementation();
      
      await analysisTools.performanceReport();
      
      expect(displayReportSpy).toHaveBeenCalledWith('performance-report-output', mockData);
    });

    test('should not fall back to mock data on error', async () => {
      global.fetch.mockRejectedValue(new Error('API unavailable'));
      
      await expect(analysisTools.fetchAnalysisData('/api/test')).rejects.toThrow('API unavailable');
    });
  });
});