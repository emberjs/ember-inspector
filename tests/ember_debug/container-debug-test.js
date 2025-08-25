import { module, skip } from 'qunit';
import { settled, visit, waitUntil } from '@ember/test-helpers';
import { A as emberA } from '@ember/array';

import EmberDebug from 'ember-debug/main';
import setupEmberDebugTest from '../helpers/setup-ember-debug-test';

// import PortImport from 'ember-debug/port';
// let Port = PortImport;

// TODO: Figure out why these tests are flaky and enable them again
module('Ember Debug - Container', function (hooks) {
  let name, message;

  // hooks.before(async () => {
  //   Port = (await PortImport).default;
  // });

  setupEmberDebugTest(hooks);

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
    assert.ok(types.find((x) => x.name === 'controller'));
    assert.ok(types.find((x) => x.name === 'route'));
  });

  skip('#getInstances', async function t(assert) {
    await visit('/simple');

    EmberDebug.port.trigger('container:getInstances', {
      containerType: 'controller',
    });
    await settled();

    assert.strictEqual(name, 'container:instances');
    let instances = emberA(message.instances);
    assert.ok(instances.find((x) => x.name === 'simple'));
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
