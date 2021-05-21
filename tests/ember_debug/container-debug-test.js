import { module, test } from 'qunit';
import { settled, visit } from '@ember/test-helpers';
import { A as emberA } from '@ember/array';

import EmberDebug from 'ember-debug/main';
import Port from 'ember-debug/port';
import setupEmberDebugTest from '../helpers/setup-ember-debug-test';

module('Ember Debug - Container', function (hooks) {
  let name, message;

  setupEmberDebugTest(hooks, {
    Port: Port.extend({
      init() {},
      send(n, m) {
        name = n;
        message = m;
      },
    }),
  });

  test('#getTypes', async function t(assert) {
    await visit('/simple');

    EmberDebug.port.trigger('container:getTypes');
    await settled();

    assert.equal(name, 'container:types');
    let types = emberA(message.types);
    assert.ok(types.findBy('name', 'controller'));
    assert.ok(types.findBy('name', 'route'));
  });

  test('#getInstances', async function t(assert) {
    await visit('/simple');

    EmberDebug.port.trigger('container:getInstances', {
      containerType: 'controller',
    });
    await settled();

    assert.equal(name, 'container:instances');
    let instances = emberA(message.instances);
    assert.ok(instances.findBy('name', 'simple'));
  });

  test('#getInstances on a non existing type', async function t(assert) {
    await visit('/simple');

    EmberDebug.port.trigger('container:getInstances', {
      containerType: 'not-here',
    });
    await settled();

    assert.equal(name, 'container:instances');
    assert.equal(message.status, 404);
  });
});

