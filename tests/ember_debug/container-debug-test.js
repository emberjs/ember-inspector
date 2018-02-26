import { module, test } from 'qunit';
import Ember from "ember";
import { visit } from 'ember-native-dom-helpers';
import require from 'require';

const { run, A: emberA, Application } = Ember;
let EmberDebug;
let port, name, message;
let App;

function setupApp() {
  App = Application.create();
  App.setupForTesting();
  App.injectTestHelpers();

  App.Router.map(function() {
    this.route('simple');
  });
}

module("Container Debug", function(hooks) {
  hooks.beforeEach(function() {
    EmberDebug = require('ember-debug/main').default;
    EmberDebug.Port = EmberDebug.Port.extend({
      init() {},
      send(n, m) {
        name = n;
        message = m;
      }
    });
    run(function() {
      setupApp();
      EmberDebug.set('owner', App.__deprecatedInstance__);
    });
    run(EmberDebug, 'start');
    port = EmberDebug.port;
  });

  hooks.afterEach(function() {
    name = null;
    message = null;
    EmberDebug.destroyContainer();
    run(App, 'destroy');
  });

  test("#getTypes", async function t(assert) {
    await visit('/simple');

    port.trigger('container:getTypes');
    await wait();

    assert.equal(name, 'container:types');
    let types = emberA(message.types);
    assert.ok(types.findBy('name', 'controller'));
    assert.ok(types.findBy('name', 'route'));
  });

  test("#getInstances", async function t(assert) {
    await visit('/simple');

    port.trigger('container:getInstances', { containerType: 'controller' });
    await wait();

    assert.equal(name, 'container:instances');
    let instances = emberA(message.instances);
    assert.ok(instances.findBy('name', 'simple'));
  });

  test("#getInstances on a non existing type", async function t(assert) {
    await visit('/simple');

    port.trigger('container:getInstances', { containerType: 'not-here' });
    await wait();

    assert.equal(name, 'container:instances');
    assert.equal(message.status, 404);
  });
});
