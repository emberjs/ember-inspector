/// <reference path="./utils-types.d.ts" />


/**
 * @param {string} first
 * @param  {...any} args
 */
export function trace(first, ...args) {
  console.debug(`%c${first}`, 'color: #bbb', ...args);
}

/**
 * @template H
 * @template C
 */
class DetailsImpl {
  /**
   * @param {H} header
   * @param {C} context
   */
  constructor(header, context) {
    this.header = header;
    this.context = context;
    this.enqueued = false;
    this.ignored = false;

    /** @type {string | null} */
    this.destination = null;
  }
}

/** @typedef {DetailsImpl<string, string>} Details */

/**
 * @template T
 * @param {string} data
 * @param {T} style
 * @return { { text: string, style: T } }
 */
export function styled(data, style) {
  return { text: data, style };
}

/**
 * @template T
 * @param {GroupOptions} context
 * @param { (console: Logger) => T } callback
 * @return {T | undefined}
 */
export function debugGroup({ header, context, style, connected }, callback) {
  const details = new DetailsImpl(header, context);
  const logger = new Logger(new GroupedLogger(), details);

  if (style === 'ignored') {
    logger.trace(`from ${context} Ignored ${header}`);
    return;
  }

  const contextStyle = connected ? 'color: green' : 'color: #666';

  try {
    return callback(logger);
  } catch(e) {
    console.error(e);
  } finally {
    const fullHeader = messageHeader({
      context: styled(details.context, connected ? 'connected' : 'normal'),
      header: styled(details.header, style),
      destination: details.destination ? styled(details.destination, 'normal') : undefined
    });

    console.groupCollapsed(...fullHeader);
    logger.flush();
    console.groupEnd();
  }
}

const FLUSHED_STYLE = 'color: hsl(50, 100%, 95%); background-color: hsl(39, 100%, 18%);';
const ERROR_STYLE = 'color: red; background-color: rgb(255, 240, 240);';
const WARNING_STYLE = 'color: hsl(39, 100%, 18%); background-color: hsl(50, 100%, 95%);';
const NORMAL_STYLE = 'color: #bbb';

/**
 * @param {object} options
 * @param { { text: string; style: 'connected' | 'normal' } } options.context;
 * @param { { text: string; style: HeaderStyle } } options.header
 * @param { { text: string, style: 'normal' } | undefined= } options.destination
 * @param { { sawError?: boolean; sawWarning?: boolean }= } options.details
 * @return { string[] }
 */
export function messageHeader({ context, header, destination, details }) {

  /** @type { { text: string, style: 'flushed' | 'error' | 'warning' | 'normal' } | null } */
  let logHeader = null;

  if (header.text) {
    if (header.style === 'flushed' && header.text) {
      logHeader = { text: header.text, style: 'flushed' };
    } else if (details && details.sawError) {
      logHeader = { text: header.text || 'error', style: 'error' };
    } else if (details && details.sawWarning) {
      logHeader = { text: header.text || 'warning', style: 'warning' };
    } else {
      logHeader = { text: header.text, style: 'normal' };
    }
  }

  let logDestination = destination ? `-> ${destination.text}` : null;

  let logMessage = `%cfrom %c${context.text}`;
  let contextStyle = context.style === 'connected' ? 'color: green' : 'color: #666';
  let styles = [NORMAL_STYLE, contextStyle];

  if (logDestination) {
    logMessage += ` %c${logDestination}`
    styles.push(NORMAL_STYLE);
  }

  if (logHeader) {
    logMessage += ` %c${logHeader.text}`;

    switch (logHeader.style) {
      case 'flushed':
        styles.push(FLUSHED_STYLE);
        break;
      case 'error':
        styles.push(ERROR_STYLE);
        break;
      case 'warning':
        styles.push(WARNING_STYLE);
        break;
      case 'normal':
        styles.push(NORMAL_STYLE);
        break;
    }
  }

  return [logMessage, ...styles];
}


export class Logger {
  /**
   * @param {LoggerDelegate} delegate
   * @param {DetailsImpl<string | undefined, string | undefined>} details
   */
  constructor(delegate, details) {
    this.delegate = delegate;
    this.details = details;
    this.sawWarning = false;
    this.sawError = false;
  }

  /**
   * @param {RecordOptions} options
   * @param {true=} force
   */
  record(options, force) {
    if (typeof options === 'string') {
      this.details[options] = true;
    } else {
      let currentValue = this.details[options.key];

      if (typeof currentValue === 'string' && currentValue !== options.value && !force) {
        this.emit('error', `Unexpectedly recording ${options.key} to ${options.value}, but it was already set to ${currentValue}`);
        return;
      }

      this.details[options.key] = options.value;
    }
  }


  /**
   * @param {RecordOptions} options
   */
  override(options) {
    this.record(options, true);
  }

  /**
   * @param {ConsoleLevel} level
   * @param {...unknown} values
   */
  emit(level, ...values) {
    if (level === 'warn') {
      this.sawWarning = true;
    }

    if (level === 'error') {
      this.sawError = true;
    }

    return this.delegate.emit(level, ...values);
  }

  flush() {
    return this.delegate.flush();
  }

  /**
   * @param {unknown} value
   * @param {...unknown} args
   */
  warn(value, ...args) {
    this.emit('warn', value, ...args);
  }

  /**
   * @param  {unknown} value
   * @param {...unknown} args
   */
  trace(value, ...args) {
    if (typeof value === 'string') {
      this.delegate.emit('trace', `%c${value}`, 'color: #666', ...args);
    } else {
      this.delegate.emit('trace', value, ...args);
    }
  }

  /**
   * @param  {unknown} value
   * @param {...unknown} args
   */
  error(value, ...args) {
    if (typeof value === 'string') {
      this.delegate.emit('error', `%c${value}`, 'color: #b00', ...args);
    } else {
      this.delegate.emit('error', value, ...args);
    }
  }

  /**
   *
   * @param  {unknown} value
   * @param {...unknown} args
   */
  info(value, ...args) {
    if (typeof value === 'string') {
      this.delegate.emit('info', `%c${value}`, 'color: #333', ...args);
    } else {
      this.delegate.emit('info', value, ...args);
    }
  }

}

export class GroupedLogger {
  constructor() {
    /** @type {ConsoleMessage[]} */
    this.messages = [];
  }

  /**
   * @param {ConsoleLevel} level
   * @param {...unknown} values
   */
  emit(level, ...values) {
    this.messages.push({ type: level, value: values })
  }

  flush() {
    emitLoggerToConsole(...this.messages)
  }
}

/**
 * @param {...ConsoleMessage} messages
 */
export function emitLoggerToConsole(...messages) {
  for (let message of messages) {
    switch (message.type) {
      case 'trace': {
        console.debug(...message.value);
        continue;
      }

      case 'warn': {
        console.warn(...message.value);
        continue;
      }

      case 'info': {
        console.info(...message.value);
        continue;
      }

      case 'error': {
        console.error(...message.value);
        continue;
      }

      default: {
        // This should never happen. It's here to produce a red-line error if any
        // cases aren't handled.
        unreachable(message.type, `unhandled console message`);
      }
    }
  }
}


class ImmediateLogger {
  /**
   *
   * @param {ConsoleLevel} level
   * @param  {...unknown} values
   */
  emit(level, ...values) {
    emitLoggerToConsole({ type: level, value: values });
  }

  flush() {
    // nothing to flush; everything is immediately flushed
  }
}

export const IMMEDIATE_LOGGER = new Logger(new ImmediateLogger, new DetailsImpl(undefined, undefined));

export class Response {
  /**
   * @param {ConnectionKind} connection
   * @param {object} message
   * @return {MessageResponse}
   */
  post(connection, message) {
    return { type: 'post', to: connection, message };
  }

  /**
   * @param  {...unknown} args
   * @return {MessageResponse}
   */
  trace(...args) {
    return { type: 'log', level: 'trace', log: args };
  }


  /**
   * @param  {...unknown} args
   * @return {MessageResponse}
   */
  info(...args) {
    return { type: 'log', level: 'info', log: args };
  }


  /**
   * @param  {...unknown} args
   * @return {MessageResponse}
   */
  warn(...args) {
    return { type: 'log', level: 'warn', log: args };
  }

  /**
   * @return {MessageResponse}
   */
  nothing() {
    return { type: 'nothing' };
  }
}

export const response = new Response();

/**
 * @param {never} value
 * @param {string} message
 */
export function unreachable(value, message) {
  console.error(message, value);
  throw new Error(message);
}

