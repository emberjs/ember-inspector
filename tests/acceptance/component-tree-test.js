import registerWaiter from 'ember-raf-scheduler/test-support/register-waiter';
import {
  click,
  currentURL,
  fillIn,
  findAll,
  triggerEvent,
  triggerKeyEvent,
  visit,
  settled,
  rerender,
} from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupTestAdapter, respondWith, sendMessage } from '../test-adapter';

function textFor(selector, context) {
  return context.querySelector(selector).textContent.trim();
}

registerWaiter();

let GUID = 1;

function Serialized(id = `ember${GUID++}`) {
  return { id };
}

function Args({ names = [], positionals = 0 } = {}) {
  let named = {};

  for (let name of names) {
    named[name] = Serialized();
  }

  let positional = [];

  for (let i = 0; i < positionals; i++) {
    positional.push(Serialized());
  }

  return { named, positional };
}

function Route(
  {
    id,
    name,
    args = Args(),
    instance = Serialized(),
    template = `my-app/templates/${name}.hbs`,
    bounds = 'range',
  },
  ...children
) {
  return {
    id: `render-node:${id}:outlet`,
    type: 'outlet',
    name: 'main',
    args: Args(),
    instance: null,
    template: null,
    bounds: 'range',
    children: [
      {
        id: `render-node:${id}`,
        type: 'route-template',
        name,
        args,
        instance,
        template,
        bounds,
        children,
      },
    ],
  };
}

function TopLevel({ id }, ...children) {
  return Route(
    {
      id,
      name: '-top-level',
      instance: null,
      template: 'packages/@ember/-internals/glimmer/lib/templates/outlet.hbs',
    },
    ...children,
  );
}

function Component(
  { id, name, args = Args(), instance = null, bounds = 'range' },
  ...children
) {
  return {
    id: `render-node:${id}`,
    type: 'component',
    name,
    args,
    instance,
    template: `my-app/templates/components/${name}.hbs`,
    bounds,
    children,
  };
}

function getRenderTree({ withChildren, withManyChildren } = {}) {
  const children = [];
  if (withChildren) {
    children.push(
      Component({ id: 5, name: 'sub-task' }),
      Component({ id: 6, name: 'sub-task' }),
    );
  }
  if (withManyChildren) {
    for (let i = 5; i < 105; i++) {
      children.push(Component({ id: i, name: 'sub-task-' + i }));
    }
  }
  return [
    TopLevel(
      { id: 0 },
      Route(
        { id: 1, name: 'application', instance: Serialized('ember123') },
        Route(
          { id: 2, name: 'todos' },
          Component(
            { id: 3, name: 'todo-list', instance: Serialized('ember456') },
            Component(
              {
                id: 4,
                name: 'todo-item',
                args: Args({ names: ['subTasks'], positionals: 0 }),
                instance: Serialized('ember789'),
              },
              ...children,
            ),
          ),
        ),
      ),
    ),
  ];
}

module('Component Tab', function (hooks) {
  setupTestAdapter(hooks);
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    GUID = 1;

    respondWith('view:getTree', {
      type: 'view:renderTree',
      tree: getRenderTree(),
    });
  });

  test('It should correctly display the component tree', async function (assert) {
    await visit('/component-tree');

    let treeNodes = findAll('.component-tree-item');
    assert.strictEqual(treeNodes.length, 4, 'expected some tree nodes');

    let expandedNodes = findAll('.component-tree-item .expanded');
    assert.strictEqual(
      expandedNodes.length,
      3,
      'all nodes should be expanded except the leaf node',
    );

    let names = [];

    [...treeNodes].forEach(function (node) {
      // remove newlines and extra whitespace to improve component arg readability
      names.push(textFor('code', node).replace(/\s\s+/g, ' '));
    });

    assert.deepEqual(
      names,
      [
        'application route',
        'todos route',
        'TodoList',
        'TodoItem @subTasks ={{ ... }}',
      ],
      'expected names for all views/components',
    );
  });

  test('It allows users to expand and collapse nodes', async function (assert) {
    await visit('/component-tree');

    let treeNodes = findAll('.component-tree-item');
    assert.strictEqual(treeNodes.length, 4, 'expected some tree nodes');

    let expanders = findAll('.component-tree-item__expand');
    let expanderEl = expanders[expanders.length - 1];
    await click(expanderEl);

    treeNodes = findAll('.component-tree-item');
    assert.strictEqual(treeNodes.length, 3, 'the last node should be hidden');
  });

  test('It allows users to expand and collapse nodes with arrow keys', async function (assert) {
    await visit('/component-tree');

    // handle messages
    respondWith('view:showInspection', () => {
      return false;
    });
    respondWith('objectInspector:inspectById', () => {
      return false;
    });

    let treeNodes = findAll('.component-tree-item');
    assert.strictEqual(treeNodes.length, 4, 'expected some tree nodes');

    // select first component node and collapse with left arrow
    await click(treeNodes[2]);
    await triggerKeyEvent(document, 'keydown', 37);

    treeNodes = findAll('.component-tree-item');
    assert.strictEqual(treeNodes.length, 3, 'child nodes should be hidden');

    // press right arrow key
    await triggerKeyEvent(document, 'keydown', 39);

    treeNodes = findAll('.component-tree-item');
    assert.strictEqual(treeNodes.length, 4, 'child nodes should be visible');
  });

  test('It allows users to navigate nodes with arrow keys', async function (assert) {
    await visit('/component-tree');

    // select first node with down arrow key
    respondWith('view:showInspection', false);
    respondWith('objectInspector:inspectById', ({ objectId }) => {
      assert.strictEqual(objectId, 'ember123');
      return false;
    });
    await triggerKeyEvent(document, 'keydown', 40);

    // select next node with down arrow key
    respondWith('view:showInspection', false);
    respondWith('objectInspector:inspectById', ({ objectId }) => {
      assert.strictEqual(objectId, 'ember2');
      return false;
    });
    await triggerKeyEvent(document, 'keydown', 40);

    // select next node with right arrow key
    respondWith('view:showInspection', false);
    respondWith('objectInspector:inspectById', ({ objectId }) => {
      assert.strictEqual(objectId, 'ember456');
      return false;
    });
    await triggerKeyEvent(document, 'keydown', 39);

    // select next node with right arrow key
    respondWith('view:showInspection', false);
    respondWith('objectInspector:inspectById', ({ objectId }) => {
      assert.strictEqual(objectId, 'ember789');
      return false;
    });
    await triggerKeyEvent(document, 'keydown', 39);

    // select previous node with left arrow key
    respondWith('view:showInspection', false);
    respondWith('objectInspector:inspectById', ({ objectId }) => {
      assert.strictEqual(objectId, 'ember456');
      return false;
    });
    await triggerKeyEvent(document, 'keydown', 37);

    // select previous node with up arrow key
    respondWith('view:showInspection', false);
    respondWith('objectInspector:inspectById', ({ objectId }) => {
      assert.strictEqual(objectId, 'ember2');
      return false;
    });
    await triggerKeyEvent(document, 'keydown', 38);
  });

  test('It allows users to expand and collapse children with alt key', async function (assert) {
    await visit('/component-tree');

    let expanders = findAll('.component-tree-item__expand.expanded');
    assert.strictEqual(
      expanders.length,
      3,
      'disclosure triangles all in expanded state',
    );

    // Click second component with alt key;
    // this should collapse itself and children
    let expanderEl = expanders[1];
    await click(expanderEl, { altKey: true });
    expanders = findAll('.component-tree-item__expand.expanded');
    assert.strictEqual(
      expanders.length,
      1,
      'clicked disclosure triangle no longer expanded',
    );

    expanders = findAll('.component-tree-item__expand');
    expanderEl = expanders[1];
    await click(expanderEl);

    // After expanding second component without alt key
    // the children should be collapsed
    expanders = findAll('.component-tree-item__expand');
    expanderEl = expanders[2];
    assert
      .dom(expanderEl)
      .hasClass('collapsed', 'child component was collapsed');
  });

  test('It should filter the view tree using the search text', async function (assert) {
    await visit('/component-tree');

    let treeNodes = findAll('.component-tree-item');
    assert.strictEqual(treeNodes.length, 4, 'expected some tree nodes');

    await fillIn('[data-test-filter-views] input', 'list');
    treeNodes = findAll('.component-tree-item');
    assert.strictEqual(treeNodes.length, 3, 'expected filtered tree nodes');

    let visibleComponentNames = [];
    [...treeNodes].forEach(function (node) {
      visibleComponentNames.push(textFor('code', node));
    });

    assert.deepEqual(
      visibleComponentNames,
      ['application route', 'todos route', 'TodoList'],
      'expected names for all views/components',
    );
  });

  test('It should clear the search filter when the clear button is clicked', async function (assert) {
    await visit('/component-tree');

    let treeNodes = findAll('.component-tree-item');
    assert.strictEqual(treeNodes.length, 4, 'expected all tree nodes');

    await fillIn('[data-test-filter-views] input', 'xxxxxx');
    treeNodes = findAll('.component-tree-item');
    assert.strictEqual(treeNodes.length, 0, 'expected filtered tree nodes');

    await click('[data-test-search-field-clear-button]');
    treeNodes = findAll('.component-tree-item');
    assert.strictEqual(treeNodes.length, 4, 'expected all tree nodes');
  });

  test('It should update the view tree when the port triggers a change, preserving the expanded state of existing nodes', async function (assert) {
    await visit('/component-tree');

    let expanders = findAll('.component-tree-item__expand');
    let expanderEl = expanders[expanders.length - 1];
    await click(expanderEl);

    let treeNodes = findAll('.component-tree-item');
    assert.strictEqual(treeNodes.length, 3, 'the last node should be hidden');

    // resend the same view tree
    await sendMessage({
      type: 'view:renderTree',
      tree: getRenderTree(),
    });

    await rerender();

    assert
      .dom('.component-tree-item')
      .exists({ count: 3 }, 'the last node should still be hidden');
  });

  test('It should update the view tree when the port triggers a change, adding new children', async function (assert) {
    await visit('/component-tree');

    assert
      .dom('.component-tree-item')
      .exists({ count: 4 }, 'the last node should still be collapsed');

    assert
      .dom('.component-tree-item__expand')
      .exists({ count: 3 }, 'last item should not have expander yet');

    // send a view tree with children
    await sendMessage({
      type: 'view:renderTree',
      tree: getRenderTree({ withChildren: true }),
    });

    assert
      .dom('.component-tree-item__expand')
      .exists({ count: 4 }, 'it should have a new expander');

    assert
      .dom('.component-tree-item')
      .exists({ count: 4 }, 'the last node should still be collapsed');

    let expanders = findAll('.component-tree-item__expand');
    let expanderEl = expanders[expanders.length - 1];
    await click(expanderEl);

    assert
      .dom('.component-tree-item')
      .exists({ count: 6 }, 'it should show the children');
  });

  test('Scrolling a component tree into view', async function (assert) {
    await visit('/component-tree');

    function isInViewport(element) {
      const rect = element?.getBoundingClientRect();
      // if its not, then all is 0
      return rect?.top >= 0 && rect?.left >= 0;
    }

    respondWith('view:showInspection', false, { count: 3 });

    await sendMessage({
      type: 'view:renderTree',
      tree: getRenderTree({ withManyChildren: true }),
    });

    await settled();

    await sendMessage({
      type: 'view:inspectComponent',
      id: `render-node:90`,
    });

    await settled();

    assert
      .dom('.component-tree-item--pinned')
      .exists({ count: 1 }, 'it should pinn the selected item');

    assert.true(
      isInViewport(
        document.getElementsByClassName('component-tree-item--pinned').item(0),
      ),
      'it should show the pinned item',
    );

    await sendMessage({
      type: 'view:previewComponent',
      id: `render-node:10`,
    });

    await settled();

    assert
      .dom('.component-tree-item--highlighted')
      .exists({ count: 1 }, 'it should show the previewing item');

    assert.true(
      isInViewport(
        document
          .getElementsByClassName('component-tree-item--highlighted')
          .item(0),
      ),
      'it should show the preview item',
    );

    await sendMessage({
      type: 'view:cancelSelection',
      id: `render-node:10`,
    });

    await settled();

    assert
      .dom('.component-tree-item--pinned')
      .exists(
        { count: 0 },
        'it should not scroll back to the pinned component after preview finished',
      );

    await sendMessage({
      type: 'view:renderTree',
      tree: getRenderTree({ withManyChildren: true }),
    });

    await settled();

    assert
      .dom('.component-tree-item--pinned')
      .exists(
        { count: 0 },
        'it should not scroll back to the pinned component after new render tree',
      );

    const scrollTarget = document
      .getElementsByClassName('scroll-target')
      .item(0);

    const scrolledPromise = new Promise((res) => {
      scrollTarget.parentElement.addEventListener('scroll', () => {
        res();
      });
    });

    scrollTarget.scrollIntoView({
      behavior: 'auto',
      block: 'nearest',
      inline: 'nearest',
    });

    await scrolledPromise;
    await settled();

    assert
      .dom('.component-tree-item--pinned')
      .exists({ count: 1 }, 'it should show the pinned item after scrolling');

    assert.true(
      isInViewport(
        document.getElementsByClassName('component-tree-item--pinned').item(0),
      ),
      'it should show the pinned item',
    );
  });

  test('Previewing / showing a view on the client', async function (assert) {
    await visit('/component-tree');

    respondWith('view:showInspection', ({ id, pin }) => {
      assert.strictEqual(id, 'render-node:1', 'application route');
      assert.false(pin, 'preview only');
      return false;
    });

    await triggerEvent('.component-tree-item', 'mouseenter');

    respondWith('view:hideInspection', false);

    await triggerEvent('.component-tree-item', 'mouseleave');
  });

  test('Scrolling an element into view', async function (assert) {
    await visit('/component-tree');

    respondWith('view:scrollIntoView', ({ id }) => {
      assert.strictEqual(id, 'render-node:1', 'application route');
      return false;
    });

    await click('[data-test-scroll-into-view]');
  });

  test('View DOM element in Elements panel', async function (assert) {
    await visit('/component-tree');

    respondWith('view:inspectElement', ({ id }) => {
      assert.strictEqual(id, 'render-node:1', 'application route');
      return false;
    });

    await click('[data-test="view-dom-element"]');
  });

  test('Inspects the component in the object inspector on click and shows tooltip', async function (assert) {
    await visit('/component-tree');

    respondWith('view:showInspection', ({ id, pin }) => {
      assert.strictEqual(id, 'render-node:3', '<TodoList>');
      assert.true(pin, 'pin');
      return false;
    });

    respondWith('objectInspector:inspectById', ({ objectId }) => {
      assert.strictEqual(
        objectId,
        'ember456',
        'Client asked to inspect the application controller',
      );
      return false;
    });

    await click('.component-tree-item--component code');
  });

  test('Selects a component in the tree in response to a message from the context menu', async function (assert) {
    // Go to the component tree and populate it before sending the message from the context menu
    // also collapse the tree to test auto expanding to pinned item
    await visit('/component-tree');
    let treeNodes = findAll('.component-tree-item');
    assert.strictEqual(treeNodes.length, 4, 'expected some tree nodes');

    let expanders = findAll('.component-tree-item__expand');
    let expanderEl = expanders[expanders.length - 1];
    await click(expanderEl);

    treeNodes = findAll('.component-tree-item');
    assert.strictEqual(treeNodes.length, 3, 'the last node should be hidden');

    respondWith('view:showInspection', ({ id, pin }) => {
      assert.strictEqual(id, 'render-node:4', '<TodoList>');
      assert.true(pin, 'pin');
      return false;
    });

    respondWith('objectInspector:inspectById', ({ objectId }) => {
      assert.strictEqual(
        objectId,
        'ember789',
        'Client asked to inspect the <TodoItem> component',
      );
      return false;
    });

    await sendMessage({
      type: 'view:inspectComponent',
      id: 'render-node:4',
    });

    assert.strictEqual(
      currentURL(),
      '/component-tree?pinned=render-node%3A4',
      'It pins the element id as a query param',
    );

    await settled();

    assert
      .dom('.component-tree-item--pinned')
      .hasText(
        'TodoItem @subTasks ={{ ... }}',
        'It selects the item in the tree corresponding to the element',
      );

    treeNodes = findAll('.component-tree-item');
    assert.strictEqual(treeNodes.length, 4, 'the last node should be shown');
  });

  test('Can inspect component arguments that are objects in component tree', async function (assert) {
    await visit('/component-tree');

    respondWith('objectInspector:inspectById', ({ objectId }) => {
      assert.strictEqual(
        objectId,
        'ember1',
        'Client asked to inspect the <TodoList> component argument',
      );
      return false;
    });

    await click('[data-test-arg-object]');
  });
});
