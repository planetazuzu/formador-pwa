/**
 * Sistema de logging centralizado
 * Permite registrar errores y eventos de forma estructurada
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, any>;
  error?: Error;
  stack?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Mantener solo los últimos 100 logs en memoria

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    const errorStr = error ? ` Error: ${error.message}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}${errorStr}`;
  }

  private addLog(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
      error,
      stack: error?.stack,
    };

    this.logs.push(entry);

    // Mantener solo los últimos maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // En desarrollo, siempre mostrar en consola
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = this.formatMessage(level, message, context, error);
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage, context || '', error || '');
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, context || '', error || '');
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, context || '', error || '');
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, context || '', error || '');
          break;
      }
    } else {
      // En producción, solo mostrar errores críticos
      if (level === LogLevel.ERROR) {
        console.error(this.formatMessage(level, message, context, error));
      }
    }

    // Aquí se podría enviar a un servicio externo (Sentry, LogRocket, etc.)
    // this.sendToExternalService(entry);
  }

  debug(message: string, context?: Record<string, any>) {
    this.addLog(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.addLog(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.addLog(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.addLog(LogLevel.ERROR, message, context, error);
  }

  // Obtener logs recientes
  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filtered = this.logs;

    if (level) {
      filtered = filtered.filter((log) => log.level === level);
    }

    if (limit) {
      filtered = filtered.slice(-limit);
    }

    return filtered;
  }

  // Limpiar logs
  clearLogs() {
    this.logs = [];
  }

  // Exportar logs como JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Enviar a servicio externo (ejemplo con Sentry)
  // private sendToExternalService(entry: LogEntry) {
  //   if (entry.level === LogLevel.ERROR && entry.error) {
  //     // Ejemplo con Sentry
  //     // Sentry.captureException(entry.error, {
  //     //   extra: entry.context,
  //     //   level: 'error',
  //     // });
  //   }
  // }
}

export const logger = new Logger();

// Helper para capturar errores de forma automática
export function captureError(error: Error, context?: Record<string, any>) {
  logger.error('Error capturado', error, context);
  
  // En producción, aquí se podría enviar a un servicio de monitoreo
  if (process.env.NODE_ENV === 'production') {
    // Ejemplo: enviar a servicio de logging
    // fetch('/api/log-error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ error: error.message, stack: error.stack, context }),
    // });
  }
}

