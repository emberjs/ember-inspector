import { module, test } from 'qunit';
import { click, settled, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { run } from '@ember/runloop';

import EmberDebugImport from 'ember-debug/main';
import PortImport from 'ember-debug/port';

function findRenderNode(nodes, name) {
  for (const node of nodes) {
    const found =
      node.name === name ? node : findRenderNode(node.children, name);

    if (found) {
      return found;
    }
  }
}

module('Acceptance | ember-debug', function (hooks) {
  setupApplicationTest(hooks);

  let EmberDebug;
  let responses;
  let errors;

  function request(type, message = {}) {
    EmberDebug.port.messageReceived(type, message);
  }

  hooks.beforeEach(async function () {
    EmberDebug = (await EmberDebugImport).default();
    const Port = (await PortImport).default;

    responses = {};
    errors = [];

    EmberDebug.Port = class extends Port {
      init() {}
      send(type, message) {
        responses[type] = message;
      }
    };

    // eslint-disable-next-line ember/no-runloop
    run(() => {
      EmberDebug.isTesting = true;
      EmberDebug.owner = this.owner;
      EmberDebug.start();
    });

    // ember-debug catches its own errors and only logs them.
    EmberDebug.adapter.handleError = (error) => errors.push(String(error));

    await visit('/');
  });

  hooks.afterEach(function (assert) {
    const { deprecations, deprecationsToSend } = EmberDebug.deprecationDebug;

    // ember-debug keeps deprecations for its Deprecations tab, so Ember does not throw them.
    assert.deepEqual(
      deprecations.concat(deprecationsToSend).map(({ message }) => message),
      [],
      'no deprecations',
    );
    assert.deepEqual(errors, [], 'no errors in ember-debug');

    EmberDebug.destroyContainer();
    EmberDebug.clear();
    EmberDebug.isTesting = false;
  });

  test('Components tab', async function (assert) {
    await click('button');

    request('view:getTree', { immediate: true });

    const counter = findRenderNode(
      responses['view:renderTree'].tree,
      'Counter',
    );

    assert.deepEqual(counter.args.named, { clicks: 1 });

    request('objectInspector:inspectById', { objectId: counter.instance.id });

    assert.strictEqual(
      responses['objectInspector:updateObject'].objectId,
      counter.instance.id,
    );
  });

  test('Routes tab', async function (assert) {
    request('route:getTree');
    request('route:getCurrentRoute');
    await settled();

    const { tree, error } = responses['route:routeTree'];

    assert.strictEqual(error, undefined);
    assert.strictEqual(tree?.children[0].value.name, 'application');
    assert.deepEqual(responses['route:currentRoute'], {
      name: 'index',
      url: '/',
    });

    request('objectInspector:inspectRoute', { name: 'application' });

    assert.true(
      responses['objectInspector:updateObject'].name.includes(
        'route:application',
      ),
    );
  });

  test('Data tab', function (assert) {
    request('data:checkAdapter');
    request('data:getModelTypes');

    assert.true(responses['data:hasAdapter'].hasAdapter);
    assert.deepEqual(responses['data:modelTypesAdded'].modelTypes, []);
  });

  test('Deprecations tab', async function (assert) {
    request('deprecation:watch');
    await settled();

    const { deprecations } = responses['deprecation:deprecationsAdded'];

    assert.deepEqual(
      deprecations.map(({ message }) => message),
      [],
    );
  });

  test('Info tab', function (assert) {
    request('general:getLibraries');

    assert.strictEqual(
      responses['general:libraries'].libraries[0].name,
      'Ember',
    );
  });

  test('Promises tab', function (assert) {
    request('promise:getAndObservePromises');

    assert.true(Array.isArray(responses['promise:promisesUpdated'].promises));
  });

  test('Container tab', function (assert) {
    request('container:getTypes');
    request('container:getInstances', { containerType: 'service' });

    const types = responses['container:types'].types.map(({ name }) => name);

    assert.true(types.includes('service'));
    assert.strictEqual(responses['container:instances'].status, 200);

    request('objectInspector:inspectByContainerLookup', {
      name: 'service:router',
    });

    assert.true(
      responses['objectInspector:updateObject'].name.includes('RouterService'),
    );
  });

  test('Render Performance tab', function (assert) {
    request('render:watchProfiles');

    assert.true(responses['render:profilesAdded'].profiles.length > 0);
  });
});
