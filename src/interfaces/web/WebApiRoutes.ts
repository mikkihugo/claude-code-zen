/**
 * Web API Routes - RESTful API endpoint definitions
 *
 * Centralized API route definitions for the web dashboard.
 * Handles all HTTP API endpoints with proper error handling.
 */

import type { Express, Request, Response } from 'express';
import { createLogger } from '../../utils/logger.js';
import type { WebConfig } from './WebConfig.js';
import type { WebDataService } from './WebDataService.js';
import type { WebSessionManager } from './WebSessionManager.js';

export class WebApiRoutes {
  private logger = createLogger('WebAPI');
  private config: WebConfig;
  private sessionManager: WebSessionManager;
  private dataService: WebDataService;

  constructor(config: WebConfig, sessionManager: WebSessionManager, dataService: WebDataService) {
    this.config = config;
    this.sessionManager = sessionManager;
    this.dataService = dataService;
  }

  /**
   * Setup all API routes
   */
  setupRoutes(app: Express): void {
    const api = this.config.apiPrefix!;

    // Health check endpoint
    app.get(`${api}/health`, this.handleHealthCheck.bind(this));

    // System status endpoint
    app.get(`${api}/status`, this.handleSystemStatus.bind(this));

    // Swarm management endpoints
    app.get(`${api}/swarms`, this.handleGetSwarms.bind(this));
    app.post(`${api}/swarms`, this.handleCreateSwarm.bind(this));

    // Task management endpoints
    app.get(`${api}/tasks`, this.handleGetTasks.bind(this));
    app.post(`${api}/tasks`, this.handleCreateTask.bind(this));

    // Document management endpoints
    app.get(`${api}/documents`, this.handleGetDocuments.bind(this));

    // Command execution endpoint
    app.post(`${api}/execute`, this.handleExecuteCommand.bind(this));

    // Settings management endpoints
    app.get(`${api}/settings`, this.handleGetSettings.bind(this));
    app.post(`${api}/settings`, this.handleUpdateSettings.bind(this));

    this.logger.info(`API routes registered with prefix: ${api}`);
  }

  /**
   * Health check endpoint
   */
  private handleHealthCheck(req: Request, res: Response): void {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0-alpha.73',
      uptime: process.uptime(),
    });
  }

  /**
   * System status endpoint
   */
  private async handleSystemStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await this.dataService.getSystemStatus();
      res.json(status);
    } catch (error) {
      this.logger.error('Failed to get system status:', error);
      res.status(500).json({ error: 'Failed to get system status' });
    }
  }

  /**
   * Get swarms endpoint
   */
  private async handleGetSwarms(req: Request, res: Response): Promise<void> {
    try {
      const swarms = await this.dataService.getSwarms();
      res.json(swarms);
    } catch (error) {
      this.logger.error('Failed to get swarms:', error);
      res.status(500).json({ error: 'Failed to get swarms' });
    }
  }

  /**
   * Create swarm endpoint
   */
  private async handleCreateSwarm(req: Request, res: Response): Promise<void> {
    try {
      const swarm = await this.dataService.createSwarm(req.body);
      this.logger.info(`Created swarm: ${swarm.name}`);
      res.json(swarm);
    } catch (error) {
      this.logger.error('Failed to create swarm:', error);
      res.status(500).json({ error: 'Failed to create swarm' });
    }
  }

  /**
   * Get tasks endpoint
   */
  private async handleGetTasks(req: Request, res: Response): Promise<void> {
    try {
      const tasks = await this.dataService.getTasks();
      res.json(tasks);
    } catch (error) {
      this.logger.error('Failed to get tasks:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  }

  /**
   * Create task endpoint
   */
  private async handleCreateTask(req: Request, res: Response): Promise<void> {
    try {
      const task = await this.dataService.createTask(req.body);
      this.logger.info(`Created task: ${task.title}`);
      res.json(task);
    } catch (error) {
      this.logger.error('Failed to create task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  /**
   * Get documents endpoint
   */
  private async handleGetDocuments(req: Request, res: Response): Promise<void> {
    try {
      const documents = await this.dataService.getDocuments();
      res.json(documents);
    } catch (error) {
      this.logger.error('Failed to get documents:', error);
      res.status(500).json({ error: 'Failed to get documents' });
    }
  }

  /**
   * Execute command endpoint
   */
  private async handleExecuteCommand(req: Request, res: Response): Promise<void> {
    try {
      const { command, args } = req.body;
      const result = await this.dataService.executeCommand(command, args);
      this.logger.info(`Executed command: ${command}`);
      res.json(result);
    } catch (error) {
      this.logger.error('Command execution failed:', error);
      res.status(500).json({ error: 'Command execution failed' });
    }
  }

  /**
   * Get settings endpoint
   */
  private handleGetSettings(req: Request, res: Response): void {
    const session = this.sessionManager.getSession(req.sessionId!);
    res.json({
      session: session?.preferences,
      system: {
        theme: this.config.theme,
        realTime: this.config.realTime,
      },
    });
  }

  /**
   * Update settings endpoint
   */
  private handleUpdateSettings(req: Request, res: Response): void {
    const success = this.sessionManager.updateSessionPreferences(req.sessionId!, req.body);

    if (success) {
      this.logger.debug(`Updated settings for session: ${req.sessionId}`);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  }
}
