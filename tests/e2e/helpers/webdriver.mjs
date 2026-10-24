import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { setTimeout as sleep } from 'node:timers/promises';
import { findElement } from './find.mjs';

const ELEMENT = 'element-6066-11e4-a52e-4f735466cecf';

/**
 * Starts a W3C WebDriver server, such as `safaridriver`,
 * and opens a session on it.
 * `portArgs` gives the command-line arguments that set the port.
 */
export async function startSession(command, capabilities, portArgs) {
  let port = await freePort();
  let child = spawn(command, portArgs(port), { stdio: 'inherit' });
  let base = `http://127.0.0.1:${port}`;

  try {
    await waitForServer(base);

    let { sessionId } = await request(base, 'POST', '/session', {
      capabilities: { alwaysMatch: capabilities },
    });

    return new Session(`${base}/session/${sessionId}`, child);
  } catch (error) {
    child.kill();
    throw error;
  }
}

class Session {
  currentWindow = null;

  constructor(url, child) {
    this.url = url;
    this.child = child;
  }

  send(method, path, body) {
    return request(this.url, method, path, body);
  }

  async windows() {
    return this.send('GET', '/window/handles');
  }

  async switchTo(handle) {
    if (this.currentWindow === handle) return;

    await this.send('POST', '/window', { handle });
    this.currentWindow = handle;
  }

  /**
   * Drives one window of the session.
   * Each call switches to that window first.
   */
  driver(handle) {
    let session = this;

    async function evaluate(fn, ...args) {
      await session.switchTo(handle);
      return session.send('POST', '/execute/sync', {
        script: `return (${fn})(...arguments)`,
        args,
      });
    }

    /**
     * Retries when the inspector re-renders the element
     * between finding it and acting on it.
     */
    async function withElement(selector, text, action) {
      for (let attempt = 1; ; attempt++) {
        let element = await evaluate(findElement, selector, text);

        if (!element) {
          throw new Error(`no element matches ${selector} "${text ?? ''}"`);
        }

        try {
          return await action(element);
        } catch (error) {
          if (attempt === 5 || !/stale element/.test(error.message)) {
            throw error;
          }
        }

        await sleep(100);
      }
    }

    return {
      evaluate,

      click: (selector, text) =>
        withElement(selector, text, (element) =>
          session.send('POST', `/element/${element[ELEMENT]}/click`, {}),
        ),

      hover: (selector, text) =>
        withElement(selector, text, (element) =>
          session.send('POST', '/actions', {
            actions: [
              {
                type: 'pointer',
                id: 'mouse',
                actions: [{ type: 'pointerMove', origin: element, x: 0, y: 0 }],
              },
            ],
          }),
        ),
    };
  }

  async close() {
    try {
      await this.send('DELETE', '');
    } finally {
      this.child.kill();
      await new Promise((resolve) => this.child.once('exit', resolve));
    }
  }
}

async function request(base, method, path, body) {
  let response = await fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let { value } = await response.json();

  if (!response.ok) {
    throw new Error(`${method} ${path}: ${value.error}: ${value.message}`);
  }

  return value;
}

async function waitForServer(base) {
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      let status = await request(base, 'GET', '/status');
      if (status.ready) return;
    } catch {
      /**
       * The server is not listening yet.
       */
    }

    await sleep(250);
  }

  throw new Error(`the WebDriver server at ${base} did not start`);
}

async function freePort() {
  let server = createServer();

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  let { port } = server.address();
  await new Promise((resolve) => server.close(resolve));

  return port;
}
