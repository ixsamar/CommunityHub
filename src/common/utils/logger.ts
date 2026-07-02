export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export class Logger {
  private static formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const ctxString = context ? ` [${context}]` : '';
    return `[${timestamp}] [${level}]${ctxString}: ${message}`;
  }

  public static debug(message: string, context?: string, data?: unknown) {
    if (__DEV__) {
      console.log(this.formatMessage('DEBUG', message, context));
      if (data) console.log(JSON.stringify(data, null, 2));
    }
  }

  public static info(message: string, context?: string, data?: unknown) {
    console.log(this.formatMessage('INFO', message, context));
    if (data && __DEV__) console.log(JSON.stringify(data, null, 2));
  }

  public static warn(message: string, context?: string, data?: unknown) {
    console.warn(this.formatMessage('WARN', message, context));
    if (data) console.warn(JSON.stringify(data, null, 2));
  }

  public static error(message: string, context?: string, error?: unknown) {
    console.error(this.formatMessage('ERROR', message, context));
    if (error) {
      if (error instanceof Error) {
        console.error(error.message);
        console.error(error.stack);
      } else {
        console.error(JSON.stringify(error, null, 2));
      }
    }
  }
}
