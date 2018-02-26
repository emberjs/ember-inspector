import { visit, setApplication, setupContext, setupApplicationContext, teardownContext, teardownApplicationContext } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { A as emberA } from '@ember/array';
import Application from '@ember/application';
import EmberRouter from '@ember/routing/router';
import { module, test } from 'qunit';
import require from 'require';
import wait from 'ember-test-helpers/wait';

let EmberDebug;
let port, name, message;
let App;

function setupApp() {
  let Router = EmberRouter.extend();
  Router.map(function() {
    this.route('simple');
  });

  App = Application.create({ autoboot: false });
  App.register('router:main', Router);
}

module("Container Debug", function(hooks) {
  hooks.beforeEach(async function() {
    EmberDebug = require('ember-debug/main').default;
    EmberDebug.Port = EmberDebug.Port.extend({
      init() {},
      send(n, m) {
        name = n;
        message = m;
      }
    });

    setupApp();
    await setApplication(App);
    await setupContext(this);
    await setupApplicationContext(this);

    run(() => {
      EmberDebug.set('owner', this.owner);
    });

    run(EmberDebug, 'start');
    port = EmberDebug.port;
  });

  hooks.afterEach(async function() {
    name = null;
    message = null;
    EmberDebug.destroyContainer();
    await teardownApplicationContext(this);
    await teardownContext(this);
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
