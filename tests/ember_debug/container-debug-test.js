import { visit } from '@ember/test-helpers';
import { A as emberA } from '@ember/array';

import { module, test } from 'qunit';
import require from 'require';
import wait from 'ember-test-helpers/wait';

import { destroyEIApp, setupEIApp } from '../helpers/setup-destroy-ei-app';

let EmberDebug;
let port, name, message;
let App;

module('Ember Debug - Container', function(hooks) {
  hooks.beforeEach(async function() {
    EmberDebug = require('ember-debug/main').default;
    EmberDebug.Port = EmberDebug.Port.extend({
      init() {},
      send(n, m) {
        name = n;
        message = m;
      }
    });

    App = await setupEIApp.call(this, EmberDebug, function() {
      this.route('simple');
    });

    port = EmberDebug.port;
  });

  hooks.afterEach(async function() {
    name = null;
    message = null;
    await destroyEIApp.call(this, EmberDebug, App);
  });

  test('#getTypes', async function t(assert) {
    await visit('/simple');

    port.trigger('container:getTypes');
    await wait();

    assert.equal(name, 'container:types');
    let types = emberA(message.types);
    assert.ok(types.findBy('name', 'controller'));
    assert.ok(types.findBy('name', 'route'));
  });

  test('#getInstances', async function t(assert) {
    await visit('/simple');

    port.trigger('container:getInstances', { containerType: 'controller' });
    await wait();

    assert.equal(name, 'container:instances');
    let instances = emberA(message.instances);
    assert.ok(instances.findBy('name', 'simple'));
  });

  test('#getInstances on a non existing type', async function t(assert) {
    await visit('/simple');

    port.trigger('container:getInstances', { containerType: 'not-here' });
    await wait();

    assert.equal(name, 'container:instances');
    assert.equal(message.status, 404);
  });
});
