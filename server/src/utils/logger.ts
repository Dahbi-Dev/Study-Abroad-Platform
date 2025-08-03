import fs from 'fs';
import path from 'path';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  private logLevel: LogLevel;
  private logFile?: string;

  constructor() {
    this.logLevel = this.getLogLevelFromEnv();
    this.logFile = process.env.LOG_FILE;
    
    // Create logs directory if it doesn't exist
    if (this.logFile) {
      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  private getLogLevelFromEnv(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase();
    switch (level) {
      case 'ERROR':
        return LogLevel.ERROR;
      case 'WARN':
        return LogLevel.WARN;
      case 'INFO':
        return LogLevel.INFO;
      case 'DEBUG':
        return LogLevel.DEBUG;
      default:
        return LogLevel.INFO;
    }
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ` ${args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ')}` : '';
    return `[${timestamp}] [${level}] ${message}${formattedArgs}`;
  }

  private writeToFile(message: string): void {
    if (this.logFile) {
      fs.appendFileSync(this.logFile, message + '\n');
    }
  }

  private log(level: LogLevel, levelName: string, message: string, ...args: any[]): void {
    if (level <= this.logLevel) {
      const formattedMessage = this.formatMessage(levelName, message, ...args);
      
      // Write to console
      if (process.env.NODE_ENV === 'development') {
        switch (level) {
          case LogLevel.ERROR:
            console.error(formattedMessage);
            break;
          case LogLevel.WARN:
            console.warn(formattedMessage);
            break;
          case LogLevel.INFO:
            console.info(formattedMessage);
            break;
          case LogLevel.DEBUG:
            console.debug(formattedMessage);
            break;
        }
      }
      
      // Write to file
      this.writeToFile(formattedMessage);
    }
  }

  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, 'ERROR', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, 'WARN', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, 'INFO', message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, ...args);
  }

  // HTTP request logging
  request(method: string, url: string, statusCode: number, responseTime: number, userAgent?: string): void {
    const message = `${method} ${url} ${statusCode} ${responseTime}ms`;
    if (userAgent) {
      this.info(message, { userAgent });
    } else {
      this.info(message);
    }
  }

  // Database operation logging
  db(operation: string, collection: string, duration?: number, error?: Error): void {
    if (error) {
      this.error(`DB ${operation} on ${collection} failed:`, error.message);
    } else {
      this.debug(`DB ${operation} on ${collection}${duration ? ` (${duration}ms)` : ''}`);
    }
  }

  // Authentication logging
  auth(action: string, email: string, success: boolean, reason?: string): void {
    const message = `Auth ${action} for ${email}: ${success ? 'SUCCESS' : 'FAILED'}`;
    if (success) {
      this.info(message);
    } else {
      this.warn(message, reason ? { reason } : {});
    }
  }

  // Security logging
  security(event: string, details: Record<string, any>): void {
    this.warn(`Security event: ${event}`, details);
  }
}

export const logger = new Logger();