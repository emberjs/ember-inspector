import { module, skip } from 'qunit';
import { settled, visit, waitUntil } from '@ember/test-helpers';
import { A as emberA } from '@ember/array';

import EmberDebug from 'ember-debug/main';
import Port from 'ember-debug/port';
import setupEmberDebugTest from '../helpers/setup-ember-debug-test';

// TODO: Figure out why these tests are flaky and enable them again
module('Ember Debug - Container', function (hooks) {
  let name, message;

  setupEmberDebugTest(hooks, {
    Port: class extends Port {
      init() {}
      send(n, m) {
        name = n;
        message = m;
      }
    },
  });

  skip('#getTypes', async function t(assert) {
    await visit('/simple');

    EmberDebug.port.trigger('container:getTypes');
    await settled();

    await waitUntil(
      function () {
        return name === 'container:types';
      },
      { timeout: 3000 },
    );

    assert.strictEqual(name, 'container:types');
    let types = emberA(message.types);
    assert.ok(types.findBy('name', 'controller'));
    assert.ok(types.findBy('name', 'route'));
  });

  skip('#getInstances', async function t(assert) {
    await visit('/simple');

    EmberDebug.port.trigger('container:getInstances', {
      containerType: 'controller',
    });
    await settled();

    assert.strictEqual(name, 'container:instances');
    let instances = emberA(message.instances);
    assert.ok(instances.findBy('name', 'simple'));
  });

  skip('#getInstances on a non existing type', async function t(assert) {
    await visit('/simple');

    EmberDebug.port.trigger('container:getInstances', {
      containerType: 'not-here',
    });
    await settled();

    assert.strictEqual(name, 'container:instances');
    assert.strictEqual(message.status, 404);
  });
});
