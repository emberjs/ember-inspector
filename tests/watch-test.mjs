import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import {
  existsSync,
  globSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { stripVTControlCharacters } from 'node:util';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const emberDebugDist = join(root, 'packages/ember-debug/dist');
const inspectorDist = join(root, 'packages/ember-inspector/dist');
const versionsSource = join(root, 'packages/ember-debug/utils/versions.js');

const TIMEOUT = 180_000;

/**
 * Runs `pnpm watch` in its own process group,
 * so that the test can stop rollup and ember-cli together.
 */
function startWatch() {
  let child = spawn('pnpm', ['watch'], {
    cwd: root,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let watch = { child, output: '', exitCode: undefined };

  child.stdout.on('data', (data) => (watch.output += data));
  child.stderr.on('data', (data) => (watch.output += data));
  child.on('exit', (code) => (watch.exitCode = code));

  return watch;
}

function stopWatch(watch) {
  if (watch.exitCode !== undefined) return;

  try {
    process.kill(-watch.child.pid, 'SIGTERM');
  } catch {
    /** The process group is already gone. */
  }
}

/**
 * Rollup prints colors on CI, for example `created \x1b[1mdist`.
 */
function count(watch, pattern) {
  return stripVTControlCharacters(watch.output).split(pattern).length - 1;
}

async function waitFor(watch, description, condition) {
  let start = Date.now();

  while (Date.now() - start < TIMEOUT) {
    if (watch.exitCode !== undefined) {
      assert.fail(
        `pnpm watch exited with ${watch.exitCode} before ${description}:\n${watch.output}`,
      );
    }

    if (condition()) return;

    await sleep(250);
  }

  assert.fail(`Timed out before ${description}:\n${watch.output}`);
}

function inspectorVersionsFiles() {
  return globSync('chrome/panes-*/versions.js', { cwd: inspectorDist }).map(
    (file) => join(inspectorDist, file),
  );
}

test(
  'pnpm watch starts from a clean checkout and rebuilds the UI after an ember-debug change',
  { timeout: TIMEOUT * 3 },
  async (t) => {
    let originalVersions = readFileSync(versionsSource, 'utf8');
    let marker = `watch-test-${randomUUID()}`;

    rmSync(emberDebugDist, { recursive: true, force: true });
    rmSync(inspectorDist, { recursive: true, force: true });

    let watch = startWatch();

    t.after(() => {
      writeFileSync(versionsSource, originalVersions);
      stopWatch(watch);
    });

    await waitFor(
      watch,
      'the first UI build',
      () => count(watch, 'Build successful') >= 1,
    );

    await waitFor(
      watch,
      'rollup is watching',
      () => count(watch, 'waiting for changes') >= 1,
    );

    assert.ok(
      existsSync(join(emberDebugDist, 'versions.js')),
      'ember-debug/dist has the build output',
    );
    assert.equal(
      inspectorVersionsFiles().length,
      1,
      'the chrome build has a copy of ember-debug',
    );

    let rollupBuilds = count(watch, 'created dist');
    let uiBuilds = count(watch, 'Build successful');

    writeFileSync(
      versionsSource,
      `${originalVersions}\nexport const WATCH_TEST_MARKER = '${marker}';\n`,
    );

    await waitFor(
      watch,
      'rollup rebuilds ember-debug',
      () => count(watch, 'created dist') > rollupBuilds,
    );

    await waitFor(
      watch,
      'the UI copies the new ember-debug build',
      () =>
        count(watch, 'Build successful') > uiBuilds &&
        inspectorVersionsFiles().some((file) =>
          readFileSync(file, 'utf8').includes(marker),
        ),
    );
  },
);
