import {
  visit,
  fillIn,
  findAll,
  click,
  triggerEvent,
} from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';

let port;

module('Component Tab', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    port = this.owner.lookup('port:main');
  });

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
      isVirtual: false,
      isComponent: false,
      objectId: 'applicationView',
      viewClass: 'App.ApplicationView',
      completeViewClass: 'App.ApplicationView',
      duration: 10,
      controller: {
        name: 'App.ApplicationController',
        completeName: 'App.ApplicationController',
        objectId: 'applicationController',
      },
      children: [
        {
          name: 'todos',
          isVirtual: false,
          isComponent: false,
          viewClass: 'App.TodosView',
          completeViewClass: 'App.TodosView',
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
              completeViewClass: 'todo-list',
              isComponent: true,
              name: 'todo-list',
              objectId: 'ember392',
              tagName: 'section',
              template: 'app/templates/components/todo-list',
              viewClass: 'todo-list',
              children: [
                {
                  completeViewClass: 'todo-item',
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

  test('It should correctly display the component tree', async function(assert) {
    let viewTree = defaultViewTree();

    await visit('/component-tree');
    run(() => {
      port.trigger('view:viewTree', { tree: viewTree });
    });
    await wait();

    let treeNodes = findAll('.component-tree-item');
    assert.equal(treeNodes.length, 4, 'expected some tree nodes');

    let expandedNodes = findAll('.component-tree-item .expanded');
    assert.equal(expandedNodes.length, 3, 'all nodes should be expanded except the leaf node');

    let templateNames = [];

    [...treeNodes].forEach(function(node) {
      templateNames.push(textFor('code', node));
    });

    assert.deepEqual(
      templateNames,
      ['application', 'todos', 'todo-list', 'todo-item'],
      'expected names for all views/components'
    );
  });

  test('It allows users to expand and collapse nodes', async function(assert) {
    let viewTree = defaultViewTree();

    await visit('/component-tree');
    run(() => {
      port.trigger('view:viewTree', { tree: viewTree });
    });
    await wait();

    let treeNodes = findAll('.component-tree-item');
    assert.equal(treeNodes.length, 4, 'expected some tree nodes');

    let expanders = findAll('.component-tree-item__expand');
    let expanderEl = expanders[expanders.length - 1];
    await click(expanderEl);

    treeNodes = findAll('.component-tree-item');
    assert.equal(treeNodes.length, 3, 'the last node should be hidden');

  });

  test('It should filter the view tree using the search text', async function(assert) {
    let viewTree = defaultViewTree();

    await visit('/component-tree');
    run(() => {
      port.trigger('view:viewTree', { tree: viewTree });
    });
    await wait();

    let treeNodes = findAll('.component-tree-item');
    assert.equal(treeNodes.length, 4, 'expected some tree nodes');

    await fillIn('.js-filter-views input', 'todo-');
    treeNodes = findAll('.component-tree-item');
    assert.equal(treeNodes.length, 2, 'expected filtered tree nodes');

    let visibleComponentNames = [];
    [...treeNodes].forEach(function(node) {
      visibleComponentNames.push(textFor('code', node));
    });

    assert.deepEqual(
      visibleComponentNames,
      ['todo-list', 'todo-item'],
      'expected names for all views/components'
    );
  });

  test("It should clear the search filter when the clear button is clicked", async function(assert) {
    let viewTree = defaultViewTree();

    await visit('/component-tree');
    run(() => {
      port.trigger('view:viewTree', { tree: viewTree });
    });
    await wait();

    let treeNodes = findAll('.component-tree-item');
    assert.equal(treeNodes.length, 4, 'expected all tree nodes');

    await fillIn('.js-filter-views input', 'xxxxxx');
    treeNodes = findAll('.component-tree-item');
    assert.equal(treeNodes.length, 0, 'expected filtered tree nodes');

    await click('.js-search-field-clear-button');
    treeNodes = findAll('.component-tree-item');
    assert.equal(treeNodes.length, 4, 'expected all tree nodes');
  });

  test('It should update the view tree when the port triggers a change, preserving the expanded state of existing nodes', async function(assert) {
    let viewTree = defaultViewTree();

    await visit('/component-tree');
    run(() => port.trigger('view:viewTree', { tree: viewTree }));
    await wait();

    let expanders = findAll('.component-tree-item__expand');
    let expanderEl = expanders[expanders.length - 1];
    await click(expanderEl);

    let treeNodes = findAll('.component-tree-item');
    assert.equal(treeNodes.length, 3, 'the last node should be hidden');

    viewTree = defaultViewTree(); // resend the same view tree
    run(() => port.trigger('view:viewTree', { tree: viewTree }));
    await wait();

    assert.dom('.component-tree-item').exists({ count: 3 }, 'the last node should still be hidden');
  });

  test('Previewing / showing a view on the client', async function(assert) {
    let messageSent = null;
    port.reopen({
      send(name, message) {
        messageSent = { name, message };
      },
    });

    await visit('/component-tree');
    let viewTree = defaultViewTree();
    viewTree.children = [];
    run(() => port.trigger('view:viewTree', { tree: viewTree }));
    await wait();
    await triggerEvent('.component-tree-item', 'mouseenter');
    assert.equal(
      messageSent.name,
      'view:previewLayer',
      'Client asked to preview layer'
    );
    assert.equal(
      messageSent.message.objectId,
      'applicationView',
      'Client sent correct id to preview layer'
    );
    await triggerEvent('.component-tree-item', 'mouseleave');
    assert.equal(
      messageSent.name,
      'view:hidePreview',
      'Client asked to hide preview'
    );
  });

  test('Scrolling an element into view', async function(assert) {
    let messageSent = null;
    port.reopen({
      send(name, message) {
        messageSent = { name, message };
      },
    });

    await visit('/component-tree');
    let viewTree = defaultViewTree();
    run(() => port.trigger('view:viewTree', { tree: viewTree }));
    await wait();

    await click('.component-tree-item__view-element');
    assert.equal(
      messageSent.name,
      'view:scrollToElement',
      'Client asked to scroll element into view'
    );
  });

  test('Inspects the component in the object inspector on click', async function(assert) {
    let messageSent = null;
    port.reopen({
      send(name, message) {
        messageSent = { name, message };
      }
    });

    await visit('/component-tree');
    let tree = defaultViewTree();
    run(() => {
      port.trigger('view:viewTree', { tree });
    });
    await wait();

    await click('.component-tree-item--component code');
    assert.equal(messageSent.name, 'objectInspector:inspectById');
    assert.equal(messageSent.message.objectId, 'ember392');
  });
});
