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

// These are used to specify that this is a debugging message notifying the background page
// of a message sent from one component to another, but not through the background page.
interface DebugFilterResponse {
  from?: string;
  to?: string;
}

interface TypedFilterResponse extends DebugFilterResponse {
  type: string;
}

interface InferredFilterResponse extends DebugFilterResponse {
  infer: true;
}

type FilterResponse = TypedFilterResponse | InferredFilterResponse | null;

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

type ConnectionKind = 'devtools' | 'inspector' | 'content' | 'inspectedWindow';

declare class Connections {
  listen(conn: Connection): void;

  devtools: Connection | null;
  inspector: Connection | null;
  content: Connection | null;
  inspectedWindow: Connection | null;
}

type MessageHandler = (collector: Logger, message: object, type: string, connections: Connections) => MessageResponse;

interface MessageHandlers {
    [key: string]: MessageHandler
}

type HeaderStyle = 'ignored' | 'flushed' | 'normal';

interface GroupOptions {
  header: string;
  context: string;
  style: HeaderStyle;
  connected?: boolean;
}
