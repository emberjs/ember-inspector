import { module, test } from 'qunit';
import { settled, visit, waitUntil } from '@ember/test-helpers';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
// eslint-disable-next-line ember/no-runloop
import { run } from '@ember/runloop';

import EmberDebugImport from 'ember-debug/main';
import setupEmberDebugTest from '../helpers/setup-ember-debug-test';

let EmberDebug;

module('Ember Debug - Time Travel', function (hooks) {
  let stateMessages = [];

  setupEmberDebugTest(hooks);

  hooks.before(async function () {
    EmberDebug = (await EmberDebugImport).default();
  });

  hooks.beforeEach(function () {
    stateMessages = [];
    EmberDebug.port.reopen({
      send(name, message) {
        if (name === 'timeTravel:state') {
          stateMessages.push(message);
        }
      },
    });

    this.owner.register(
      'controller:simple',
      class SimpleController extends Controller {
        @tracked count = 0;
      },
    );
  });

  hooks.afterEach(function () {
    EmberDebug.timeTravelDebug?.stopRecording();
  });

  function lastState() {
    return stateMessages[stateMessages.length - 1];
  }

  test('records snapshots while recording and restores them on travel', async function (assert) {
    await visit('/simple');

    const controller = this.owner.lookup('controller:simple');

    EmberDebug.port.trigger('timeTravel:startRecording');
    await settled();

    assert.true(lastState().recording, 'recording is on');
    assert.strictEqual(
      lastState().snapshots.length,
      1,
      'initial snapshot was captured on start',
    );

    run(() => {
      controller.count = 1;
    });
    await settled();

    run(() => {
      controller.count = 2;
    });
    await settled();

    await waitUntil(() => lastState().snapshots.length === 3, {
      timeout: 3000,
    });

    EmberDebug.port.trigger('timeTravel:stopRecording');
    await settled();
    assert.false(lastState().recording, 'recording is off');

    EmberDebug.port.trigger('timeTravel:travel', { index: 0 });
    await settled();

    assert.strictEqual(
      controller.count,
      0,
      'traveling to the first snapshot restored the tracked property',
    );
    assert.strictEqual(lastState().currentIndex, 0, 'currentIndex updated');

    EmberDebug.port.trigger('timeTravel:travel', { index: 2 });
    await settled();

    assert.strictEqual(
      controller.count,
      2,
      'traveling forward restored the later value',
    );
  });

  test('identical runloops are deduplicated and clear resets', async function (assert) {
    await visit('/simple');

    const controller = this.owner.lookup('controller:simple');

    EmberDebug.port.trigger('timeTravel:startRecording');
    await settled();

    // A runloop that doesn't change any recorded state
    run(() => {});
    await settled();

    assert.strictEqual(
      lastState().snapshots.length,
      1,
      'no snapshot for an unchanged runloop',
    );

    run(() => {
      controller.count = 5;
    });
    await settled();

    await waitUntil(() => lastState().snapshots.length === 2, {
      timeout: 3000,
    });

    EmberDebug.port.trigger('timeTravel:clear');
    await settled();

    assert.strictEqual(lastState().snapshots.length, 0, 'snapshots cleared');
    assert.strictEqual(lastState().currentIndex, -1, 'index reset');
  });
});
