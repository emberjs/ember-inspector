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
async function captureMessage(type, callback, match = () => true) {
  if (!EmberDebug.port) {
    throw new Error('Cannot call captureMessage without a port');
  }

  let send = EmberDebug.port.send;

  try {
    let captured;

    const receivedPromise = new Promise((resolve) => {
      setTimeout(resolve, 500);
      EmberDebug.port.send = (name, message) => {
        if (!captured && name === type && match(message)) {
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

async function inspectCounterNode() {
  let tree = await getRenderTree();
  let node = findNode(
    tree,
    (n) => n.type === 'component' && n.name === 'reactive-counter',
  );

  QUnit.assert.ok(node, 'the reactive-counter render node was found');

  let message = await captureMessage(
    'objectInspector:updateObject',
    async () => {
      EmberDebug.port.trigger('objectInspector:inspectById', {
        objectId: node.instance.id,
        renderNodeId: node.id,
      });
    },
  );

  return message;
}

function findProperty(details, name) {
  for (let mixin of details) {
    let property = mixin.properties.find((p) => p.name === name);
    if (property) {
      return property;
    }
  }
  return null;
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

          get label() {
            return `${this.args.title}: ${this.count}`;
          }

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

  test('inspecting a render node augments properties with reactivity info', async function (assert) {
    await visit('/reactive');

    let message = await inspectCounterNode();

    assert.ok(message.reactivity, 'updateObject includes a reactivity summary');
    assert.strictEqual(
      message.reactivity.updateCount,
      0,
      'no re-renders after the initial render',
    );
    assert.deepEqual(
      message.reactivity.causes,
      [],
      'nothing caused a re-render yet',
    );

    let args = findProperty(message.details, 'args');
    assert.ok(args, 'the args property is present');
    assert.ok(
      args.dependentKeys?.some((dep) => dep.name === '@title'),
      'the args property lists @title as a dependent key',
    );

    let count = findProperty(message.details, 'count');
    assert.ok(count, 'the count property is present');
    assert.ok(count.reactivity, 'count is augmented with reactivity info');
    assert.notOk(count.reactivity.changed, 'count has not changed yet');
  });

  test('getter dependencies are named and flag what changed', async function (assert) {
    await visit('/reactive');

    let message = await inspectCounterNode();

    let label = findProperty(message.details, 'label');
    assert.ok(label, 'the label getter is present');

    let depNames = (label.dependentKeys ?? []).map((d) => d.name ?? d.child);
    assert.ok(
      depNames.includes('args.title'),
      `label depends on args.title (got: ${depNames.join(', ')})`,
    );
    assert.ok(
      depNames.includes('this.count'),
      `label depends on this.count (got: ${depNames.join(', ')})`,
    );

    // Change one of the dependencies: the pushed update for the getter
    // flags the changed dependency, the other one is not flagged.
    let update = await captureMessage(
      'objectInspector:updateProperty',
      async () => {
        counterInstance.count++;
        await rerender();
      },
      (m) => m.property === 'label',
    );

    let countDep = update.dependentKeys.find(
      (d) => (d.name ?? d.child) === 'this.count',
    );
    assert.ok(countDep.changed, 'the changed dependency is flagged');

    let titleDep = update.dependentKeys.find(
      (d) => (d.name ?? d.child) === 'args.title',
    );
    assert.notOk(titleDep.changed, 'the unchanged dependency is not flagged');
  });

  test('re-renders push updated reactivity info for the inspected node', async function (assert) {
    await visit('/reactive');

    await inspectCounterNode();

    // Change internal tracked state
    let message = await captureMessage(
      'objectInspector:updateReactivity',
      async () => {
        counterInstance.count++;
        await rerender();
      },
    );

    assert.strictEqual(
      message.reactivity.updateCount,
      1,
      're-rendered once after count changed',
    );
    assert.deepEqual(
      message.reactivity.causes,
      ['this.count'],
      'count is reported as the cause of the re-render',
    );

    let count = message.properties.find((p) => p.name === 'count');
    assert.ok(count.changed, 'the count property is flagged as changed');

    let title = message.args.find((a) => a.name === '@title');
    assert.notOk(title.changed, '@title did not cause the re-render');

    // Change the arg
    message = await captureMessage(
      'objectInspector:updateReactivity',
      async () => {
        this.owner.lookup('controller:reactive').title = 'second title';
        await rerender();
      },
    );

    assert.strictEqual(
      message.reactivity.updateCount,
      2,
      're-rendered again after the arg changed',
    );
    assert.ok(
      message.reactivity.causes.includes('@title'),
      '@title is reported as a cause of the re-render',
    );

    title = message.args.find((a) => a.name === '@title');
    assert.ok(title.changed, '@title is flagged as changed');

    count = message.properties.find((p) => p.name === 'count');
    assert.notOk(count.changed, 'count did not cause this re-render');
  });

  test('inspecting without a render node id keeps the old behavior', async function (assert) {
    await visit('/reactive');

    let tree = await getRenderTree();
    let node = findNode(
      tree,
      (n) => n.type === 'component' && n.name === 'reactive-counter',
    );

    let message = await captureMessage(
      'objectInspector:updateObject',
      async () => {
        EmberDebug.port.trigger('objectInspector:inspectById', {
          objectId: node.instance.id,
        });
      },
    );

    assert.strictEqual(
      message.reactivity,
      null,
      'no reactivity summary without a render node id',
    );
  });
});
