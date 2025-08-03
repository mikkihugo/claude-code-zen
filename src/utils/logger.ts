/**
 * Utility logger implementation
 * Provides simple logging functionality for the application
 */

export interface Logger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}

class SimpleLogger implements Logger {
  constructor(private prefix: string = '') {}

  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${new Date().toISOString()}] DEBUG ${this.prefix}: ${message}`, meta || '');
    }
  }

  info(message: string, meta?: any): void {
    console.info(`[${new Date().toISOString()}] INFO ${this.prefix}: ${message}`, meta || '');
  }

  warn(message: string, meta?: any): void {
    console.warn(`[${new Date().toISOString()}] WARN ${this.prefix}: ${message}`, meta || '');
  }

  error(message: string, meta?: any): void {
    console.error(`[${new Date().toISOString()}] ERROR ${this.prefix}: ${message}`, meta || '');
  }
}

export function createLogger(prefix?: string): Logger {
  return new SimpleLogger(prefix);
}

export const defaultLogger = createLogger('claude-zen');