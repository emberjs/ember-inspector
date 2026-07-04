import { rerender, visit } from '@ember/test-helpers';
import { setComponentTemplate } from '@ember/component';
import Controller from '@ember/controller';
import QUnit, { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import GlimmerComponent from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import setupEmberDebugTest from '../helpers/setup-ember-debug-test';
import EmberDebugImport from 'ember-debug/main';

let EmberDebug;

// TODO switch to an adapter architecture, similar to the acceptance tests
async function captureMessage(type, callback) {
  if (!EmberDebug.port) {
    throw new Error('Cannot call captureMessage without a port');
  }

  let send = EmberDebug.port.send;

  try {
    let captured;

    const receivedPromise = new Promise((resolve) => {
      setTimeout(resolve, 500);
      EmberDebug.port.send = (name, message) => {
        if (!captured && name === type) {
          resolve();
          captured = JSON.parse(JSON.stringify(message));
        } else {
          send.call(EmberDebug.port, name, message);
        }
      };
    });

    await callback();
    await receivedPromise;

    if (captured) {
      return captured;
    } else {
      throw new Error(`Did not send a message of type ${type}`);
    }
  } finally {
    EmberDebug.port.send = send;
  }
}

async function getRenderTree() {
  let message = await captureMessage('view:renderTree', async () => {
    EmberDebug.port.trigger('view:getTree', {});
  });

  if (message) {
    return message.tree;
  }
}

async function getReactivity(id) {
  let message = await captureMessage('view:reactivity', async () => {
    EmberDebug.port.trigger('view:getReactivity', { id });
  });

  QUnit.assert.strictEqual(message.id, id, 'reactivity reply echoes the id');

  return message.reactivity;
}

function findNode(nodes, predicate) {
  for (let node of nodes) {
    if (predicate(node)) {
      return node;
    }

    let found = findNode(node.children, predicate);

    if (found) {
      return found;
    }
  }

  return null;
}

async function getCounterReactivity() {
  let tree = await getRenderTree();
  let node = findNode(
    tree,
    (n) => n.type === 'component' && n.name === 'reactive-counter',
  );

  QUnit.assert.ok(node, 'the reactive-counter render node was found');

  return getReactivity(node.id);
}

let counterInstance = null;

module('Ember Debug - Reactivity', function (hooks) {
  hooks.before(async function () {
    EmberDebug = (await EmberDebugImport).default();
  });

  setupEmberDebugTest(hooks, {
    routes() {
      this.route('reactive');
    },
  });

  hooks.beforeEach(function () {
    EmberDebug.IGNORE_DEPRECATIONS = true;
    counterInstance = null;

    this.owner.register(
      'controller:reactive',
      class ReactiveController extends Controller {
        @tracked title = 'first title';
      },
    );

    this.owner.register(
      'component:reactive-counter',
      setComponentTemplate(
        hbs(
          '<div class="reactive-counter">{{@title}}: {{this.count}}</div>',
          { moduleName: 'my-app/components/reactive-counter.hbs' },
        ),
        class ReactiveCounter extends GlimmerComponent {
          @tracked count = 0;

          constructor(...args) {
            super(...args);
            counterInstance = this;
          }
        },
      ),
    );

    this.owner.register(
      'template:reactive',
      hbs('<ReactiveCounter @title={{this.title}} />', {
        moduleName: 'my-app/templates/reactive.hbs',
      }),
    );
  });

  hooks.afterEach(function () {
    counterInstance = null;
  });

  test('it reports args, consumed tracked properties, and what changed', async function (assert) {
    await visit('/reactive');

    let reactivity = await getCounterReactivity();

    assert.ok(reactivity, 'a reactivity report is available');
    assert.strictEqual(
      reactivity.updateCount,
      0,
      'no re-renders after the initial render',
    );

    let title = reactivity.args.named.find((arg) => arg.name === 'title');
    assert.ok(title, 'the @title arg is reported');
    assert.notOk(title.changed, '@title has not changed');
    assert.ok(
      Array.isArray(title.dependencies),
      '@title has a (possibly empty) dependency list',
    );
    assert.strictEqual(title.inspect, '"first title"', '@title value shown');

    let count = reactivity.tracked.find((prop) => prop.name === 'count');
    assert.ok(count, 'the consumed tracked property is reported');
    assert.notOk(count.changed, 'count has not changed');

    // Change internal tracked state
    counterInstance.count++;
    await rerender();

    reactivity = await getCounterReactivity();

    assert.strictEqual(
      reactivity.updateCount,
      1,
      're-rendered once after count changed',
    );
    assert.ok(reactivity.lastRender, 'last render info is available');
    assert.notOk(
      reactivity.lastRender.initial,
      'last render is no longer the initial one',
    );

    count = reactivity.tracked.find((prop) => prop.name === 'count');
    assert.ok(
      count.changed,
      'count is flagged as the cause of the re-render',
    );

    title = reactivity.args.named.find((arg) => arg.name === 'title');
    assert.notOk(title.changed, '@title did not cause the re-render');

    // Change the arg
    this.owner.lookup('controller:reactive').title = 'second title';
    await rerender();

    reactivity = await getCounterReactivity();

    assert.strictEqual(
      reactivity.updateCount,
      2,
      're-rendered again after the arg changed',
    );

    title = reactivity.args.named.find((arg) => arg.name === 'title');
    assert.ok(
      title.changed,
      '@title is flagged as the cause of the re-render',
    );
    assert.strictEqual(
      title.inspect,
      '"second title"',
      '@title shows the new value',
    );

    count = reactivity.tracked.find((prop) => prop.name === 'count');
    assert.notOk(count.changed, 'count did not cause the re-render');
  });

  test('it returns null for unknown render node ids', async function (assert) {
    await visit('/reactive');

    // Populate the captured node map
    await getRenderTree();

    let reactivity = await getReactivity('render-node:does-not-exist');

    assert.strictEqual(
      reactivity,
      null,
      'no reactivity report for unknown nodes',
    );
  });
});
