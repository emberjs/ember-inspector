/* global chrome */

// @ts-check

/// <reference path="./content-script-module.d.ts" />

import { Logger, debugGroup, trace, messageHeader, IMMEDIATE_LOGGER, styled } from "./utils.js";

/**
 * Content script injected into the app page by chrome, works in tandem with the
 * background-script to coordinate messaging between EmberDebug, EmberInspector and the
 * ClientApp.  The content-script serves as a proxy between EmberDebug
 * and the background-script.
 *
 * Content scripts are loaded into every page, and have access to the DOM.  This uses that
 * to inject the in-page-script to determine the ClientApp version onLoad.
 */

let backgroundPage = chrome.runtime.connect({ name: 'content-script' });

class Frames {
  /** @type {WeakMap<Window, Frame>} */
  frames = new WeakMap();

  /**
   * @param {Window} frameWindow
   * @returns {boolean}
   */
  has(frameWindow) {
    return this.frames.has(window);
  }

  /**
   * @param {Window} frameWindow
   * @returns {Frame | null}
   */
  get(frameWindow) {
    return this.frames.get(frameWindow) || null;
  }

  /**
   *
   * @param {Window} frameWindow
   * @param {MessagePort} port
   * @returns {Frame}
   */
  register(frameWindow, port) {
    let frame = new Frame(port);
    this.frames.set(frameWindow, frame);
    return frame;
  }
}

class Frame {
  /**
   *
   * @param {MessagePort} port
   */
  constructor(port) {
    this.port = port;

    /** @type {string[] | null} */
    this.apps = null;
  }
}

const FRAMES = new Frames();

/**
 * Add an event listener for window.messages.
 * The initial message from EmberDebug is used to setup the event listener
 * that proxies between the content-script and EmberDebug using a MessagingChannel.
 *
 * All events from the window are filtered by checking that data and data.type
 * properties exist before sending messages on to the background-script.
 *
 * See:
 *     https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API
 */
window.addEventListener('message', function(event) {
  // received initial message from EmberDebug
  if (event.data === 'debugger-client') {
    const target = /** @type {Window} */ (event.target);

    let frame = FRAMES.register(target, event.ports[0]);
    var emberDebugPort = event.ports[0];
    listenToEmberDebugPort(emberDebugPort);
  } else if (event.data && event.data.type) {
    backgroundPage.postMessage(event.data);
  }
});

/**
 * Listen for messages from EmberDebug.
 * @param {MessagePort} emberDebugPort
 */
function listenToEmberDebugPort(emberDebugPort) {
  // listen for messages from EmberDebug, and pass them on to the background-script
  emberDebugPort.addEventListener('message', function(event) {
    logMessage(event.data, 'background');

    backgroundPage.postMessage(event.data);
  });

  // listen for messages from the EmberInspector, and pass them on to EmberDebug
  backgroundPage.onMessage.addListener(function(message) {
    if (message.from === 'devtools') {
      logMessage(message, 'inspector');

      backgroundPage.postMessage({ from: 'content-script', type: 'debug', message, to: 'inspector' });

      // forward message to EmberDebug
      emberDebugPort.postMessage(message);
    }
  });

  emberDebugPort.start();
}

/**
 * @param {object} message
 * @param {string} to
 */
function logMessage(message, to) {
  let { from = 'devtools', type = 'unknown message' } = classifyMessage(message);

  debugGroup({ header: type, context: from, style: 'normal', connected: false }, logger => {
    logger.info(message);
    logger.info(`-> ${to}`);
  });
}

/**
 *
 * @param {object} message
 * @return { { from: string | undefined, type: string | undefined } }
 */
function classifyMessage(message) {
  if (typeof message.from === 'string') {
    if (typeof message.name === 'string') {
      return { from: message.from, type: message.name };
    } else if (typeof message.type === 'string') {
      return { from: message.from, type: message.type };
    } else {
      return { from: message.from, type: undefined };
    }
  } else {
    return { from: undefined, type: undefined }
  }
}

// document.documentElement.dataset is not present for SVG elements
// this guard prevents that condition from triggering an error
if (document.documentElement && document.documentElement.dataset) {
  // let EmberDebug know that content script has executed
  document.documentElement.dataset.emberExtension = "1";
}

// Iframes should not reset the icon so we make sure
// it's the top level window before resetting.
if (window.top === window) {
  // Clear a possible previous Ember icon
  backgroundPage.postMessage({ type: 'resetEmberIcon' });
}

/**
 * Send the iframes to EmberInspector so that it can run
 * EmberDebug in the context of the iframe.
 */
async function sendIframes() {
  /**
   * Gather the iframes running in the ClientApp
   */
  let elements = [...document.getElementsByTagName('iframe')];

  let iframes = await Promise.all(elements.map(waitForIframe));

  let urls = iframes.map(frame => frame.src);

  IMMEDIATE_LOGGER.emit('trace', ...messageHeader({
    context: styled('content', 'normal'),
    header: styled('iframes', 'normal')
  }))

  backgroundPage.postMessage({ type: 'iframes', from: 'content-script', urls, location: document.location });
}

/**
 *
 * @param {HTMLIFrameElement} iframe
 * @return {Promise<HTMLIFrameElement>}
 */
function waitForIframe(iframe) {
  return new Promise((fulfill, reject) => {
    iframe.addEventListener('load', () => fulfill(iframe));
    iframe.addEventListener('error', (event) => reject(event.error));
  })
}

// Async: will send the iframes when all of them are loaded
sendIframes();
