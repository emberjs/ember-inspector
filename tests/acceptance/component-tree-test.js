import {
  click,
  currentURL,
  fillIn,
  findAll,
  triggerEvent,
  visit
} from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { respondWith, sendMessage } from '../test-adapter';

function textFor(selector, context) {
  return context.querySelector(selector).textContent.trim();
}

let treeId = 0;

function viewNodeFactory(props) {
  if (!props.template) {
    props.template = props.name;
  }
  let obj = {
    value: props,
    children: [],
    treeId: ++treeId,
  };
  return obj;
}

function viewTreeFactory(tree) {
  let children = tree.children;
  delete tree.children;
  let viewNode = viewNodeFactory(tree);
  if (children) {
    for (let i = 0; i < children.length; i++) {
      viewNode.children.push(viewTreeFactory(children[i]));
    }
  }
  return viewNode;
}

function defaultViewTree() {
  return viewTreeFactory({
    name: 'application',
    isComponent: false,
    objectId: 'applicationView',
    viewClass: 'App.ApplicationView',
    duration: 10,
    controller: {
      name: 'App.ApplicationController',
      completeName: 'App.ApplicationController',
      objectId: 'applicationController',
    },
    children: [
      {
        name: 'todos',
        isComponent: false,
        viewClass: 'App.TodosView',
        duration: 1,
        objectId: 'todosView',
        model: {
          name: 'TodosArray',
          completeName: 'TodosArray',
          objectId: 'todosArray',
          type: 'type-ember-object',
        },
        controller: {
          name: 'App.TodosController',
          completeName: 'App.TodosController',
          objectId: 'todosController',
        },
        children: [
          {
            isComponent: true,
            name: 'todo-list',
            objectId: 'ember392',
            tagName: 'section',
            template: 'app/templates/components/todo-list',
            viewClass: 'todo-list',
            children: [
              {
                isComponent: true,
                name: 'todo-item',
                objectId: 'ember267',
                tagName: 'li',
                template: 'app/templates/components/todo-item',
                viewClass: 'todo-item',
              },
            ],
          },
        ],
      },
    ],
  });
}

module('Component Tab', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    respondWith('view:getTree', {
      type: 'view:viewTree',
      tree: defaultViewTree()
    });
  });

  test('It should correctly display the component tree', async function (assert) {
    await visit('/component-tree');

    let treeNodes = findAll('.component-tree-item');
    assert.equal(treeNodes.length, 4, 'expected some tree nodes');

    let expandedNodes = findAll('.component-tree-item .expanded');
    assert.equal(expandedNodes.length, 3, 'all nodes should be expanded except the leaf node');

    let templateNames = [];

    [...treeNodes].forEach(function (node) {
      templateNames.push(textFor('code', node));
    });

    assert.deepEqual(
      templateNames,
      ['application', 'todos', 'TodoList', 'TodoItem'],
      'expected names for all views/components'
    );
  });

  test('It allows users to expand and collapse nodes', async function (assert) {
    await visit('/component-tree');

    let treeNodes = findAll('.component-tree-item');
    assert.equal(treeNodes.length, 4, 'expected some tree nodes');

    let expanders = findAll('.component-tree-item__expand');
    let expanderEl = expanders[expanders.length - 1];
    await click(expanderEl);

    treeNodes = findAll('.component-tree-item');
    assert.equal(treeNodes.length, 3, 'the last node should be hidden');
  });

  test('It allows users to expand and collapse children with alt key', async function (assert) {
    await visit('/component-tree');

    let expanders = findAll('.component-tree-item__expand.expanded');
    assert.equal(expanders.length, 3, 'disclosure triangles all in expanded state');

    // Click second component with alt key;
    // this should collapse itself and children
    let expanderEl = expanders[1];
    await click(expanderEl, { altKey: true });
    expanders = findAll('.component-tree-item__expand.expanded');
    assert.equal(expanders.length, 1, 'clicked disclosure triangle no longer expanded');

    expanders = findAll('.component-tree-item__expand');
    expanderEl = expanders[1];
    await click(expanderEl);

    // After expanding second component without alt key
    // the children should be collapsed
    expanders = findAll('.component-tree-item__expand');
    expanderEl = expanders[2];
    assert.dom(expanderEl).hasClass('collapsed', 'child component was collapsed');
  });

  test('It should filter the view tree using the search text', async function (assert) {
    await visit('/component-tree');

    let treeNodes = findAll('.component-tree-item');
    assert.equal(treeNodes.length, 4, 'expected some tree nodes');

    await fillIn('.js-filter-views input', 'todo-');
    treeNodes = findAll('.component-tree-item');
    assert.equal(treeNodes.length, 3, 'expected filtered tree nodes');

    let visibleComponentNames = [];
    [...treeNodes].forEach(function (node) {
      visibleComponentNames.push(textFor('code', node));
    });

    assert.deepEqual(
      visibleComponentNames,
      ['todos', 'TodoList', 'TodoItem'],
      'expected names for all views/components'
    );
  });

  test("It should clear the search filter when the clear button is clicked", async function (assert) {
    await visit('/component-tree');

    let treeNodes = findAll('.component-tree-item');
    assert.equal(treeNodes.length, 4, 'expected all tree nodes');

    await fillIn('.js-filter-views input', 'xxxxxx');
    treeNodes = findAll('.component-tree-item');
    assert.equal(treeNodes.length, 0, 'expected filtered tree nodes');

    await click('.js-search-field-clear-button');
    treeNodes = findAll('.component-tree-item');
    assert.equal(treeNodes.length, 4, 'expected all tree nodes');
  });

  test('It should update the view tree when the port triggers a change, preserving the expanded state of existing nodes', async function (assert) {
    await visit('/component-tree');

    let expanders = findAll('.component-tree-item__expand');
    let expanderEl = expanders[expanders.length - 1];
    await click(expanderEl);

    let treeNodes = findAll('.component-tree-item');
    assert.equal(treeNodes.length, 3, 'the last node should be hidden');

    // resend the same view tree
    await sendMessage({
      type: 'view:viewTree',
      tree: defaultViewTree()
    });

    assert.dom('.component-tree-item').exists({ count: 3 }, 'the last node should still be hidden');
  });

  test('Previewing / showing a view on the client', async function (assert) {
    await visit('/component-tree');

    respondWith('view:previewLayer', ({ objectId }) => {
      assert.equal(objectId, 'applicationView', 'Client sent correct id to preview layer');
      return false;
    });

    await triggerEvent('.component-tree-item', 'mouseenter');

    respondWith('view:hidePreview', false);

    await triggerEvent('.component-tree-item', 'mouseleave');
  });

  test('Scrolling an element into view', async function (assert) {
    await visit('/component-tree');

    respondWith('view:scrollToElement', () => {
      // TODO: this should assert the right elementId
      assert.ok(true, 'Client asked to scroll element into view');
      return false;
    });

    await click('.js-scroll-into-view');
  });

  test('View DOM element in Elements panel', async function (assert) {
    await visit('/component-tree');

    respondWith('view:inspectElement', () => {
      // TODO: this should assert the right elementId
      assert.ok(true, 'Client asked to view DOM element');
      return false;
    });

    await click('.js-view-dom-element');
  });

  test('Inspects the component in the object inspector on click', async function (assert) {
    await visit('/component-tree');

    respondWith('objectInspector:inspectById', ({ objectId }) => {
      assert.equal(objectId, 'ember392', 'Client asked to inspect the right objectId');
      return false;
    });

    await click('.component-tree-item--component code');
  });

  test('Selects a component in the tree in response to a message from the context menu', async function (assert) {
    // Go to the component tree and populate it before sending the message from the context menu
    await visit('/component-tree');

    respondWith('objectInspector:inspectById', ({ objectId }) => {
      assert.equal(objectId, 'ember267', 'Client asked to inspect the right objectId');
      return false;
    });

    await sendMessage({
      type: 'view:inspectComponent',
      viewId: 'ember267'
    });

    assert.equal(currentURL(), '/component-tree?pinnedObjectId=ember267', 'It pins the element id as a query param');
    assert.dom('.component-tree-item--selected').hasText('TodoItem', 'It selects the item in the tree corresponding to the element');
  });
});
