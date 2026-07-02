import {Logger} from './logger';

export class PerformanceMonitor {
  public static startTrace(name: string): () => void {
    const start = Date.now();
    if (__DEV__) {
      Logger.debug(`Performance trace [${name}] started`, 'PERF');
    }
    return () => {
      const duration = Date.now() - start;
      Logger.info(`Performance trace [${name}] completed in ${duration}ms`, 'PERF');
    };
  }

  public static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const trace = this.startTrace(name);
    try {
      return await fn();
    } finally {
      trace();
    }
  }

  public static measureSync<T>(name: string, fn: () => T): T {
    const trace = this.startTrace(name);
    try {
      return fn();
    } finally {
      trace();
    }
  }
}
