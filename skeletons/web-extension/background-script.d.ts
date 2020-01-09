type MessageResponse = {
  type: 'log';
  level: ConsoleLevel;
  log: unknown[];
} | {
  type: 'post';
  to: ConnectionKind;
  message: object;
} | {
  type: 'nothing'
}

interface EnqueuedMessage {
  from: ConnectionKind;
  header: string;
  message: object;
}

declare class Connection {
  start(logger: Logger, port: chrome.runtime.Port): void;
  post(logger: Logger, message: object): void;
  destroy(): void;
}

type FilterResponse = { type: string } | { infer: true } | null;

declare interface ConnectionDelegate {
  readonly name: ConnectionKind;
  readonly handlers: MessageHandlers;

  /**
   * If `{ type: string }` is returned, this overrides the default categorization mechanism.
   *
   * If `{ handled: true }` is returned the `type` is inferred from the body of the message.
   * If no type is successfully inferred, the message is sent to `unknownEvent`. Otherwise,
   * it's sent to `unknownStructuredMessage`.
   *
   * If `null` is returned, the message is not for this connection.
   */
  filter(message: object, sender: chrome.runtime.Port): FilterResponse;

  /**
   * This method will only be called if a type was identified
   */
  unknownStructuredEvent(collector: Logger, type: string, connections: Connections, message: object): MessageResponse;

  /**
   * This method will be called if a type was not identified, but `filter` didn't return `null`.
   */
  unknownEvent(collector: Logger, message: object, connections: Connections, type: string | null): MessageResponse;
}

type ConnectionKind = 'devtools' | 'inspector' | 'content' | 'host';

declare class Connections {
  listen(conn: Connection): void;

  devtools: Connection | null;
  inspector: Connection | null;
  content: Connection | null;
  host: Connection | null;
}

type MessageHandler = (collector: Logger, message: object, type: string, connections: Connections) => MessageResponse;

interface MessageHandlers {
    [key: string]: MessageHandler
}

type ConsoleLevel = 'trace' | 'info' | 'warn' | 'error';

interface ConsoleMessage {
  type: ConsoleLevel;
  value: unknown[];
}

interface LoggerDelegate {
  emit(level: ConsoleLevel, ...values: unknown[]): void;
  flush(): void;
}

declare class Logger {
  sawWarning: boolean;
  sawError: boolean;

  warn(string: unknown, ...args: unknown[]): void;
  trace(string: unknown, ...args: unknown[]): void;
  info(string: unknown, ...args: unknown[]): void;
  error(string: unknown, ...args: unknown[]): void;

  flush(): void;
}

type HeaderStyle = 'ignored' | 'flushed' | 'normal';

interface GroupOptions {
  header: string;
  context: string;
  style: HeaderStyle;
  connected?: boolean;
}
