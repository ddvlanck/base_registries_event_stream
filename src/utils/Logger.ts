import type { Logger as WinstonLogger } from 'winston';
import { createLogger, format, transports } from 'winston';

export enum LogLevel {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Verbose = 'verbose',
  Debug = 'debug',
  Silly = 'debug'
}

export const getLogger = (): Logger => new Logger(LogLevel.Info);

export class Logger {
  private readonly logger: WinstonLogger;

  public constructor(level: LogLevel) {
    this.logger = createLogger({
      level,
      format: format.combine(
        format.colorize(),
        format.label({ label: 'Base Registries LDES' }),
        format.timestamp(),
        format.printf(({
          level: levelInner,
          message,
          label: labelInner,
          timestamp,
        }: Record<string, any>): string =>
          `${timestamp} [${labelInner}] ${levelInner}: ${message}`),
      ),
      transports: [new transports.Console()],
    });
  }

  public log(level: LogLevel, message: string): void {
    this.logger.log(level, message);
  }

  public error(message: string): void {
    this.log(LogLevel.Error, message);
  }

  public warn(message: string): void {
    this.log(LogLevel.Warn, message);
  }

  public info(message: string): void {
    this.log(LogLevel.Info, message);
  }

  public verbose(message: string): void {
    this.log(LogLevel.Verbose, message);
  }

  public debug(message: string): void {
    this.log(LogLevel.Debug, message);
  }

  public silly(message: string): void {
    this.log(LogLevel.Silly, message);
  }
}
