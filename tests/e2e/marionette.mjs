import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, connect } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

/**
 * Starts a headless Firefox that a test drives through Marionette,
 * the automation protocol built into Firefox.
 *
 * Chrome context commands run with browser privileges,
 * which is how the tests open DevTools and read the console service.
 */
export async function startFirefox() {
  let port = await freePort();
  let profile = mkdtempSync(join(tmpdir(), 'ember-inspector-firefox-'));

  writeFileSync(
    join(profile, 'user.js'),
    [
      `user_pref("marionette.port", ${port});`,
      'user_pref("browser.shell.checkDefaultBrowser", false);',
      'user_pref("datareporting.policy.dataSubmissionEnabled", false);',
    ].join('\n'),
  );

  let child = spawn(
    process.env.FIREFOX ?? 'firefox',
    [
      '--marionette',
      '-remote-allow-system-access',
      '--headless',
      '--no-remote',
      '--profile',
      profile,
    ],
    { stdio: 'ignore' },
  );

  let socket = await connectWhenReady(port);
  let client = new MarionetteClient(socket);

  await client.greeting;
  await client.send('WebDriver:NewSession', { capabilities: {} });

  return {
    client,

    async stop() {
      socket.destroy();
      child.kill();
      await new Promise((resolve) => child.once('exit', resolve));
      rmSync(profile, { recursive: true, force: true });
    },
  };
}

class MarionetteClient {
  nextId = 1;
  pending = new Map();
  buffer = '';

  constructor(socket) {
    this.socket = socket;
    this.greeting = new Promise((resolve) => (this.onGreeting = resolve));
    socket.setEncoding('utf8');
    socket.on('data', (chunk) => this.receive(chunk));
  }

  /**
   * Marionette frames each message as `<length>:<json>`.
   */
  receive(chunk) {
    this.buffer += chunk;

    for (;;) {
      let colon = this.buffer.indexOf(':');
      if (colon === -1) return;

      let length = Number(this.buffer.slice(0, colon));
      let end = colon + 1 + length;
      if (this.buffer.length < end) return;

      let message = JSON.parse(this.buffer.slice(colon + 1, end));
      this.buffer = this.buffer.slice(end);

      if (!Array.isArray(message)) {
        this.onGreeting(message);
        continue;
      }

      let [, id, error, result] = message;
      let { resolve, reject } = this.pending.get(id);
      this.pending.delete(id);

      if (error) {
        reject(new Error(`${error.error}: ${error.message}`));
      } else {
        resolve(result);
      }
    }
  }

  send(command, params = {}) {
    let id = this.nextId++;
    let body = JSON.stringify([0, id, command, params]);

    this.socket.write(`${Buffer.byteLength(body)}:${body}`);

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  async setContext(context) {
    await this.send('Marionette:SetContext', { value: context });
  }

  /**
   * Runs `script` in the browser chrome.
   * The script gets `done` as its last argument and calls it with the result.
   */
  async inChrome(script, args = []) {
    await this.setContext('chrome');

    try {
      let result = await this.send('WebDriver:ExecuteAsyncScript', {
        script,
        args,
        scriptTimeout: 30_000,
      });

      return result.value;
    } finally {
      await this.setContext('content');
    }
  }
}

async function freePort() {
  let server = createServer();

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  let { port } = server.address();
  await new Promise((resolve) => server.close(resolve));

  return port;
}

async function connectWhenReady(port) {
  for (let attempt = 0; attempt < 120; attempt++) {
    let socket = await new Promise((resolve) => {
      let s = connect(port, '127.0.0.1');
      s.once('connect', () => resolve(s));
      s.once('error', () => resolve(null));
    });

    if (socket) return socket;

    await sleep(250);
  }

  throw new Error(`Firefox did not open Marionette on port ${port}`);
}
