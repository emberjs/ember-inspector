type ConsoleLevel = 'trace' | 'info' | 'warn' | 'error';

interface ConsoleMessage {
  type: ConsoleLevel;
  value: unknown[];
}

interface LoggerDelegate {
  emit(level: ConsoleLevel, ...values: unknown[]): void;
  flush(): void;
}

type RecordOptions = { key: 'header' | 'context' | 'destination', value: string } | 'enqueued' | 'ignored';

declare class Logger {
  sawWarning: boolean;
  sawError: boolean;

  record(options: RecordOptions): void;
  override(options: RecordOptions): void;

  warn(string: unknown, ...args: unknown[]): void;
  trace(string: unknown, ...args: unknown[]): void;
  info(string: unknown, ...args: unknown[]): void;
  error(string: unknown, ...args: unknown[]): void;

  flush(): void;
}
