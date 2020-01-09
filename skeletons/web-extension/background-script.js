/*global chrome*/

// @ts-check

// TODO before PR: https://stackoverflow.com/questions/53939205/how-to-avoid-extension-context-invalidated-errors-when-messaging-after-an-exte

/// <reference path="./background-script.d.ts" />

/**
 * Long lived background script running in the browser, works in tandem with the
 * client-script to coordinate messaging between EmberDebug, EmberInspector and the
 * ClientApp.  The background-script serves as a proxy between the EmberInspector
 * and the content-script.
 *
 * It is also responsible for showing the Ember icon and tooltip in the url bar.
 *
 * See:
 *     https://developer.chrome.com/extensions/background_pages
 *     https://developer.chrome.com/extensions/messaging
 */
(function() {
  "use strict";

  class Connections {
    /**
     *
     * @param { { devtools: ConnectionDelegate, inspector: ConnectionDelegate, content: ConnectionDelegate, host: ConnectionDelegate } } connections
     */
    static listen(connections) {
      new Connections(connections);
    }

    /**
     *
     * @param { { devtools: ConnectionDelegate, inspector: ConnectionDelegate, content: ConnectionDelegate, host: ConnectionDelegate } } connections
     */
    constructor({ devtools, inspector, content, host }) {
      /** @type {Connection} */
      this.devtools = new Connection(devtools);

      /** @type {Connection} */
      this.inspector = new Connection(inspector);

      /** @type {Connection} */
      this.content = new Connection(content);

      /** @type {Connection} */
      this.host = new Connection(host);

      this.listen(this.devtools);
      this.listen(this.inspector);
      this.listen(this.content);
      this.listen(this.host);
    }

    /**
     * @private
     * @param {Logger} logger
     * @param { { from: ConnectionKind, type: string } } details
     * @param {MessageResponse} response
     */
    handle(logger, details, response) {
      switch (response.type) {
        case 'nothing': {
          return;
        }

        case 'post': {
          let connection = this[response.to];

          if (connection.isWaiting) {
            connection.enqueue(logger, response.message, details.from, details.type);
          } else {
            connection.post(logger, response.message);
          }
          return;
        }

        case 'log': {
          logger.emit(response.level, ...response.log);
          return;
        }

        default: {
          unreachable(response, `unhandled message response`)
        }
      }
    }

    /**
     * @param {Connection} conn
     */
    listen(conn) {
      const from = conn.delegate.name;

      chrome.runtime.onConnect.addListener(port => {
        // NOTE: port.sender has information about the devtools tab

        /**
         * @param {object} message
         * @param {chrome.runtime.Port} port
         */
        const listener = (message, port) => {
          const rule = conn.delegate.filter(message, port);

          let messageHeader;

          if (message && (message.name || message.type)) {
            messageHeader = `${message.name || message.type}`;
          } else {
            messageHeader = '';
          }

          if (rule === null) {
            debugGroup({ context: conn.delegate.name, header: messageHeader, style: 'ignored' }, () => console.log(message));
            return;
          }

          let connected = conn.isWaiting;

          return debugGroup({ context: conn.delegate.name, header: messageHeader, style: 'normal', connected }, logger => {
            if (connected) {
              conn.start(logger, port);
            }

            let result = onPortMessage(message, port, rule, logger);

            switch (result.type) {
              case "tabId": {
                conn.tabId = result.value;
                return;
              }

              case "unknown": {
                let { message, type } = result.value;
                this.handle(logger, { from, type: '<unknown>' }, conn.delegate.unknownEvent(logger, message, this, type));
                return;
              }

              case "structured": {
                let { message, type } = result.value;

                if (type in conn.delegate.handlers) {
                  this.handle(logger, { from, type }, conn.delegate.handlers[type](logger, message, type, this));
                } else {
                  this.handle(logger, { from, type }, conn.delegate.unknownStructuredEvent(logger, type, this, message));
                }
              }
            }
          });
        }

        port.onMessage.addListener(listener);

        port.onDisconnect.addListener(() => {
          port.onMessage.removeListener(listener);
          trace(`${from} disconnected`);
          conn.destroy();
        })
      });
    }
  }

  class Connection {
    /**
     * @param {ConnectionDelegate} delegate
     */
    constructor(delegate) {
      /**
       * @private
       * @type {chrome.runtime.Port | null}
       */
      this.port = null;

      /**
       * @private
       * @type {EnqueuedMessage[]}
      */
      this.enqueued = []

      /** @private */
      this.delegate = delegate;

      /**
       * @private
       * @type { number | null }
       */
      this.tabId = null;
    }

    get isWaiting() {
      return !this.port;
    }

    /**
     * Start the connection once all of the constituent parts are active.
     *
     * @param {Logger} logger
     * @param {chrome.runtime.Port} port
     */
    start(logger, port) {
      this.port = port;

      for (let { header, from, message } of this.enqueued) {
        let desc = `flushing ${header} to ${this.delegate.name}`;
        logger.emit('trace', ...messageHeader({ text: from, style: 'normal' }, { text: desc, style: 'flushed' }, {}));
        this.port.postMessage(message);
      }

      this.enqueued = [];
    }

    /**
     * @param {Logger} logger
     * @param {object} message
     * @returns {void}
     */
    post(logger, message) {
      if (this.port) {
        logger.trace(`posting message to ${this.delegate.name}`);
        this.port.postMessage(message);
      } else {
        logger.error(`BUG: attempted to 'post' while connection is waiting`);
      }
    }

    /**
     * @param {Logger} logger
     * @param {object} message
     * @param {ConnectionKind} from
     * @param {string} header
     */
    enqueue(logger, message, from, header) {
      logger.warn(`enqueuing message to ${this.delegate.name}`);

      this.enqueued.push({ message, from, header });
    }

    /**
     * Tear down the connection
     */
    destroy() {
      this.enqueued = [];
      this.port = null;
    }
  }

  /**
   * @param {object} message
   * @param {chrome.runtime.Port} sender
   * @param { { infer: true } | { type: string } } rule
   * @param {Logger} logger
   * @returns { { type: 'tabId', value: number } | { type: 'structured', value: { type: string, message: object } } | { type: 'unknown', value: { type: string | null, tabId: number | null, message: object }} | { type: 'devtools', value: chrome.runtime.Port } } }
   */
  function onPortMessage(message, sender, rule, logger) {
    logger.info(message);

    if (message && typeof message === 'object' && message.appId && !message.from) {
      logger.trace(`Legacy bootstrap event { appId: ... }`);
      return { type: 'tabId', value: message.appId };
    }

    if (message === null || typeof message !== 'object' || !message.from) {
      logger.trace('Invalid message');
      return { type: 'unknown', value: { message, tabId: null, type: null } };
    }

    /** @type {string | undefined} */
    let type = inferType(message, rule);

    if (type === undefined) {
      logger.warn(`Invalid message (no type)`, message);
      return { type: 'unknown', value: { message, tabId: null, type: null } };
    }

    logger.trace(`from: ${message.from}`);
    logger.trace(`type: ${type}`);

    return { type: 'structured', value: { message, type }};
  }

  /**
   * Infer the type of a message.
   *
   * If a connection has already provided a type, use that. Otherwise, look for a `name` or
   * `type` property, preferring `name`.
   *
   * TODO: Allow connections to specify which field(s) to use for inference.
   *
   * @param {object} message
   * @param { { infer: true, type?: undefined } | { type: string, infer?: undefined } } rule
   * @returns {string | undefined}
   */
  function inferType(message, rule) {
    if (rule.type) {
      return rule.type;
    }

    if (typeof message.name === 'string') {
      return message.name;
    } else if (typeof message.type === 'string') {
      return message.type;
    } else {
      return;
    }
  }

  class InspectorConnection {
    /** @type {ConnectionKind} */
    name = 'inspector';

    /** @type {MessageHandlers} */
    handlers = {
    };

    /**
     * @param {object} message
     * @param {chrome.runtime.Port & { tab?: number } } port
     * @return { { type: string } | { infer: true } | null }
     */
    filter(message, port) {
      if (message && typeof message.appId === 'number') {
        return { type: 'bootstrap' };
      } else if (message && message.from && message.from === 'devtools') {
        return { infer: true };
      } else {
        return null;
      }
    }

    /**
     * @param {Logger} logger
     * @param {object} message
     * @param {Connections} connections
     * @param {string} type
     * @return {MessageResponse}
     */
    unknownEvent(logger, message, connections, type) {
      return response.trace(`Unhandled message`);
    }

    /**
     * @param {Logger} logger
     * @param {string} type
     * @param {Connections} connections
     * @param {object} message
     * @return {MessageResponse}
     */
    unknownStructuredEvent(logger, type, connections, message) {
      return response.post('host', message);
    }
  }

  class DevtoolsConnection {
    /** @type {ConnectionKind} */
    name = 'devtools';

    /**
     * @type {MessageHandlers}
     */
    handlers = {};

    /**
     * @param {object} message
     * @param {chrome.runtime.Port & { tab?: number } } port
     * @return { { type: string } | { infer: true } | null }
     */
    filter(message, port) {
      if (message && message.from && message.from === 'devtools:bootstrap') {
        return { infer: true };
      } else {
        return null;
      }
    }

    /**
     * @param {Logger} logger
     * @param {object} message
     * @param {Connections} connections
     * @param {string} type
     * @return {MessageResponse}
     */
    unknownEvent(logger, message, connections, type) {
      return response.trace('Unhandled message');
    }

    /**
     * @param {Logger} logger
     * @param {string} type
     * @param {Connections} connections
     * @param {object} message
     * @return {MessageResponse}
     */
    unknownStructuredEvent(logger, type, connections, message) {
      logger.trace(`Unhandled legacy message (name=${type}). Passing to the content page.`);

      return response.post('content', message);
    }
  }

  /** @extends ConnectionDelegate */
  class ContentPageConnection {
    /** @type {ConnectionKind} */
    name = 'content';

    /**
     * @type {MessageHandlers}
     */
    handlers = {
      iframes(logger, message, type, connections) {
        return response.post('inspector', message);
      }
    };

    /**
     *
     * @param {object} message
     * @param {chrome.runtime.Port & { tab?: number } } port
     * @return { { type: string } | { infer: true } | null }
     */
    filter(message, port) {
      if (message && message.from && message.from === 'content-script') {
        return { infer: true };
      } else {
        return null;
      }
    }

    /**
     * @param {Logger} logger
     * @param {object} message
     * @param {Connections} connections
     * @param {string} type
     * @return {MessageResponse}
     */
    unknownEvent(logger, message, connections, type) {
      return response.trace(`Unhandled unknown message`);
    }

    /**
     * @param {Logger} logger
     * @param {string} type
     * @param {Connections} connections
     * @param {object} message
     * @return {MessageResponse}
     */
    unknownStructuredEvent(logger, type, connections, message) {
      return response.trace(`Unhandled structured message`);
    }
  }

  class HostConnection {
    /** @type {ConnectionKind} */
    name = 'host';

    /**
     * @type { MessageHandlers }
     */
    handlers = {
    };

    /**
     *
     * @param {object} message
     * @param {chrome.runtime.Port & { tab?: number } } port
     * @return { { type: string } | { infer: true } | null }
     */
    filter(message, port) {
      if (message && message.type === 'inspectorLoaded' && !message.from) {
        return { type: 'inspectorLoaded' };
      }

      // the tab property isn't in the documented types, but it's mentioned as the way to filter
      // out messages from the content page at https://developer.chrome.com/extensions/devtools
      if (message && message.from && message.from === 'inspectedWindow') {
        return { infer: true };
      } else {
        return null;
      }
    }

    /**
     * @param {Logger} logger
     * @param {object} message
     * @param {Connections} connections
     * @param {string} type
     * @return {MessageResponse}
     */
    unknownEvent(logger, message, connections, type) {
      return response.trace(`Unhandled unknown message`);
    }

    /**
     * @param {Logger} logger
     * @param {string} type
     * @param {Connections} connections
     * @param {object} message
     * @return {MessageResponse}
     */
    unknownStructuredEvent(logger, type, connections, message) {
      return response.post('inspector', message);
    }
  }

  Connections.listen({
    devtools: new DevtoolsConnection(),
    inspector: new InspectorConnection(),
    content: new ContentPageConnection(),
    host: new HostConnection()
  });

  // chrome.runtime.onMessage.addListener((request, sender) => {
  //   let tab = sender.tab;

  //   if (!tab) {
  //     // not from the content-script
  //     return;
  //   } else if (!tab.id) {
  //     debugGroup(`Message without a tab id`, () => {
  //       console.log(`message`, request);
  //       console.log(`sender`, sender);
  //     });
  //     return;
  //   }

  //   if (request && request.type === 'emberVersion') {
  //     // TODO: set the version info and update title
  //   } else if (request && request.type === 'resetEmberIcon') {
  //     // TODO: hide the Ember icon
  //   } else if (request && request.type === 'inspectorLoaded') {
  //   } else {
  //     // forward the message to EmberInspector
  //     let conn = CONNECTIONS.get(tab.id);

  //     if (conn === null) {
  //       debugGroup(`Unregistered ${tab.id}`, () => {
  //         console.log(`request`, request);
  //         console.log(`connections`, CONNECTIONS);
  //       })
  //       return;
  //     }

  //     conn.post(request);
  //   }
  // });

  /**
   * @param {string} first
   * @param  {...any} args
   */
  function trace(first, ...args) {
    console.debug(`%c${first}`, 'color: #bbb', ...args);
  }

  /**
   * @template T
   * @param {GroupOptions} context
   * @param { (console: Logger) => T } callback
   * @return {T | undefined}
   */
  function debugGroup({ header, context, style, connected }, callback) {
    let logger = new Logger(new GroupedLogger());

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
      let fullHeader = messageHeader({ text: context, style: connected ? 'connected' : 'normal' }, { text: header, style }, logger);

      console.groupCollapsed(...fullHeader);
      logger.flush();
      console.groupEnd();
    }
  }

  /**
   * @param { { text: string; style: 'connected' | 'normal' } } contextOptions
   * @param { { text: string; style: HeaderStyle } } headerOptions
   * @param { { sawError?: boolean; sawWarning?: boolean } } options
   * @return { string[] }
   */
  function messageHeader(contextOptions, headerOptions, options) {
    let contextStyle = contextOptions.style === 'connected' ? 'color: green' : 'color: #666';
    let context = contextOptions.text;
    let header = headerOptions.text;

    if (headerOptions.style === 'flushed') {
      return [`%cfrom %c${context} %c${header}`, 'color: #bbb', contextStyle, 'color: hsl(50, 100%, 95%); background-color: hsl(39, 100%, 18%);'];
    } if (options && options.sawError) {
      return [`%cfrom %c${context} %c${header || 'error'}`, 'color: #bbb', contextStyle, 'color: red; background-color: rgb(255, 240, 240);'];
    } else if (options && options.sawWarning) {
      return [`%cfrom %c${context} %c${header || 'warning'}`, 'color: #bbb', contextStyle, 'color: hsl(39, 100%, 18%); background-color: hsl(50, 100%, 95%);'];
    } else {
      return [`%cfrom %c${context}${header !== '' ? ' ' : ''}%c${header}`, 'color: #bbb', contextStyle, 'color: #bbb'];
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

  class GroupedLogger {
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
  function emitLoggerToConsole(...messages) {
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

  class Logger {
    /**
     * @param {LoggerDelegate} delegate
     */
    constructor(delegate) {
      this.delegate = delegate;
      this.sawWarning = false;
      this.sawError = false;
    }

    group() {}

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

  class Response {
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
  }

  const response = new Response();

  /**
   * @param {never} value
   * @param {string} message
   */
  function unreachable(value, message) {
    console.error(message, value);
    throw new Error(message);
  }

  // var activeTabs = {},
  //     activeTabId,
  //     contextMenuAdded = false,
  //     emberInspectorChromePorts = {};

  // /**
  //  * Creates the tooltip string to show the version of libraries used in the ClientApp
  //  * @param  {Array} versions - array of library objects
  //  * @return {String} - string of library names and versions
  //  */
  // function generateVersionsTooltip(versions) {
  //   return versions.map(function(lib) {
  //     return lib.name + " " + lib.version;
  //   }).join("\n");
  // }

  // /**
  //  * Creates the title for the pageAction for the current ClientApp
  //  * @param {Number} tabId - the current tab
  //  */
  // function setActionTitle(tabId) {
  //   chrome.pageAction.setTitle({
  //     tabId: tabId,
  //     title: generateVersionsTooltip(activeTabs[tabId])
  //   });
  // }

  // /**
  //  * Update the tab's pageAction: https://developer.chrome.com/extensions/pageAction
  //  * If the user has choosen to display it, the icon is shown and the title
  //  * is updated to display the ClientApp's information in the tooltip.
  //  * @param {Number} tabId - the current tab
  //  */
  // function updateTabAction(tabId) {
  //   chrome.storage.sync.get("options", function(data) {
  //     if (!data.options || !data.options.showTomster) { return; }
  //     chrome.pageAction.show(tabId);
  //     setActionTitle(tabId);
  //   });
  // }

  // /**
  //  * Remove the curent tab's Ember icon.
  //  * Typically used to clearout the icon after reload.
  //  * @param {Number} tabId - the current tab
  //  */
  // function hideAction(tabId) {
  //   if (!activeTabs[tabId]) {
  //     return;
  //   }

  //   chrome.pageAction.hide(tabId);
  // }

  // /**
  //  * Update the tab's contextMenu: https://developer.chrome.com/extensions/contextMenus
  //  * Add a menu item called "Inspect Ember Component" that shows info
  //  * about the component in the inspector.
  //  * @param {Boolean} force don't use the activeTabs array to check for an existing context menu
  //  */
  // function updateContextMenu(force) {
  //   // The Chromium that Electron runs does not have a chrome.contextMenus,
  //   // so make sure this doesn't throw an error in Electron
  //   if (!chrome.contextMenus) {
  //     return;
  //   }

  //   // Only add context menu item when an Ember app has been detected
  //   var isEmberApp = !!activeTabs[activeTabId] || force;
  //   if (!isEmberApp && contextMenuAdded) {
  //     chrome.contextMenus.remove('inspect-ember-component');
  //     contextMenuAdded = false;
  //   }

  //   if (isEmberApp && !contextMenuAdded) {
  //     chrome.contextMenus.create({
  //       id: 'inspect-ember-component',
  //       title: 'Inspect Ember Component',
  //       contexts: ['all'],
  //       onclick: function() {
  //         chrome.tabs.sendMessage(activeTabId, {
  //           from: 'devtools',
  //           type: 'view:contextMenu'
  //         });
  //       }
  //     });
  //     contextMenuAdded = true;
  //   }
  // }

  // /**
  //  * Listen for a connection request from the EmberInspector.
  //  * When the EmberInspector connects to the extension a messageListener
  //  * is added for the specific EmberInspector instance, and saved into
  //  * an array, keyed by appId.
  //  *
  //  * @param {Port} emberInspectorChromePort
  //  */
  // chrome.runtime.onConnect.addListener(function(emberInspectorChromePort) {
  //   var appId;

  //   /**
  //    * Listen for messages from the EmberInspector.
  //    * The first message is used to save the port, all others are forwarded
  //    * to the content-script.
  //    * @param {Message} message
  //    */
  //   emberInspectorChromePort.onMessage.addListener(function(message) {
  //     // if the message contains the appId, this is the first
  //     // message and the appId is used to map the port for this app.
  //     if (message.appId) {
  //       appId = message.appId;

  //       emberInspectorChromePorts[appId] = emberInspectorChromePort;

  //       emberInspectorChromePort.onDisconnect.addListener(function() {
  //         delete emberInspectorChromePorts[appId];
  //       });
  //     } else if (message.from === 'devtools') {
  //       // all other messages from EmberInspector are forwarded to the content-script
  //       // https://developer.chrome.com/extensions/tabs#method-sendMessage
  //       chrome.tabs.sendMessage(appId, message);
  //     }
  //   });
  // });

  // /**
  //  * Listen for messages from the content-script.
  //  * A few events trigger specfic behavior, all others are forwarded to EmberInspector.
  //  * @param {Object} request
  //  * @param {MessageSender} sender
  //  */
  // chrome.runtime.onMessage.addListener(function(request, sender) {
  //   // only listen to messages from the content-script
  //   if (!sender.tab) {
  //     // noop
  //   } else if (request && request.type === 'emberVersion') {
  //     // set the version info and update title
  //     activeTabs[sender.tab.id] = request.versions;

  //     updateTabAction(sender.tab.id);
  //     updateContextMenu();
  //   } else if (request && request.type === 'resetEmberIcon') {
  //     // hide the Ember icon
  //     hideAction(sender.tab.id);
  //   } else if (request && request.type === 'inspectorLoaded') {
  //     updateContextMenu(true);
  //   } else {
  //     // forward the message to EmberInspector
  //     var emberInspectorChromePort = emberInspectorChromePorts[sender.tab.id];
  //     if (emberInspectorChromePort) { emberInspectorChromePort.postMessage(request); }
  //   }
  // });

  // /**
  //  * Keep track of which browser tab is active and update the context menu.
  //  */
  // chrome.tabs.onActivated.addListener(({ tabId }) => {
  //   activeTabId = tabId;
  //   if (activeTabs[tabId]) {
  //     updateTabAction(tabId);
  //   }
  //   updateContextMenu();
  // });

  // /**
  //  * Only keep track of active tabs
  //  */
  // chrome.tabs.onRemoved.addListener(({ tabId }) => {
  //   delete activeTabs[tabId];
  // });

}());
