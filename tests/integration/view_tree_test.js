/* jshint ignore:start */
import Ember from "ember";
import { test } from 'ember-qunit';
import { module } from 'qunit';
import startApp from '../helpers/start-app';
var App;
var run = Ember.run;

var port;

module('View Tree Tab', {
  beforeEach() {
    App = startApp({
      adapter: 'basic'
    });
    port = App.__container__.lookup('port:main');
  },
  afterEach() {
    Ember.run(App, App.destroy);
  }
});

var treeId = 0;
function viewNodeFactory(props) {
  if (!props.template) {
    props.template = props.name;
  }
  var value = props;
  var obj = {
    value: props,
    children: [],
    treeId: ++treeId
  };
  return obj;
}

function viewTreeFactory(tree) {
  var children = tree.children;
  delete tree.children;
  var viewNode = viewNodeFactory(tree);
  if (children) {
    for (var i = 0; i < children.length; i++) {
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
      objectId: 'applicationController'
    },
    children: [
      {
        name: 'posts',
        isVirtual: false,
        isComponent: false,
        viewClass: 'App.PostsView',
        completeViewClass: 'App.PostsView',
        duration: 1,
        objectId: 'postsView',
        model: {
          name: 'PostsArray',
          completeName: 'PostsArray',
          objectId: 'postsArray',
          type: 'type-ember-object'
        },
        controller: {
          name: 'App.PostsController',
          completeName: 'App.PostsController',
          objectId: 'postsController'
        },
        children: []
      },
      {
        name: 'comments',
        isVirtual: false,
        isComponent: false,
        viewClass: 'App.CommentsView',
        completeViewClass: 'App.CommentsView',
        duration: 2.5,
        objectId: 'commentsView',
        model: {
          name: 'CommentsArray',
          completeName: 'CommentsArray',
          objectId: 'commentsArray',
          type: 'type-ember-object'
        },
        controller: {
          name: 'App.CommentsController',
          completeName: 'App.CommentsController',
          objectId: 'commentsController'
        },
        children: []
      }
    ]
  });
}

test("It should correctly display the view tree", function(assert) {
  var viewTree = defaultViewTree();

  visit('/');

  andThen(function() {
    run(function() {
      port.trigger('view:viewTree', { tree: viewTree } );
    });
    return wait();
  });

  andThen(() => {

    var $treeNodes = findByLabel('tree-node');
    assert.equal($treeNodes.length, 3, 'expected some tree nodes');
    var $treeView = $treeNodes.filter(':first');
    var controllerNames = [],
        templateNames = [],
        modelNames = [],
        viewClassNames = [],
        durations = [];

    function label(theLabel, context) {
      return findByLabel(theLabel, context).filter(':first').text().trim();
    }

    $treeNodes.each(function() {
      templateNames.push(label('view-template', this));
      controllerNames.push(label('view-controller', this));
      viewClassNames.push(label('view-class', this));
      modelNames.push(label('view-model', this));
      durations.push(label('view-duration', this));
    });

    var titleTips = find('span[title]:not([data-label])').map(function (i, node) {
      return node.getAttribute('title');
    }).toArray().sort();

    assert.deepEqual(controllerNames, [
      'App.ApplicationController',
      'App.PostsController',
      'App.CommentsController'
    ], 'expected controller names');

    assert.deepEqual(templateNames, [
      'application',
      'posts',
      'comments'
    ], 'expected template names');

    assert.deepEqual(modelNames, [
      '--',
      'PostsArray',
      'CommentsArray'
    ], 'expected model names');

    assert.deepEqual(viewClassNames, [
      'App.ApplicationView',
      'App.PostsView',
      'App.CommentsView'
    ], 'expected view class names');

    assert.deepEqual(durations, [
      '10.00ms',
      '1.00ms',
      '2.50ms'
    ], 'expected render durations');

    assert.deepEqual(titleTips, [
      'App.ApplicationController',
      'App.ApplicationView',
      'App.CommentsController',
      'App.CommentsView',
      'App.PostsController',
      'App.PostsView',
      'CommentsArray',
      'PostsArray',
      'application',
      'comments',
      'posts'
    ], 'expected title tips');
  });

});

test("It should update the view tree when the port triggers a change", function(assert) {
  assert.expect(4);
  var $treeNodes, viewTree = defaultViewTree();

  visit('/')
  .then(function() {
    port.trigger('view:viewTree', { tree: viewTree });
    return wait();

  })
  .then(function() {

    $treeNodes = findByLabel('tree-node');
    assert.equal($treeNodes.length, 3);
    assert.equal(findByLabel('view-controller').filter(':last').text().trim(), 'App.CommentsController');

    viewTree = defaultViewTree();
    viewTree.children.splice(0, 1);
    viewTree.children[0].value.controller.name = 'App.SomeController';

    port.trigger('view:viewTree', { tree: viewTree });
    return wait();

  })
  .then(function() {

    $treeNodes = findByLabel('tree-node');
    assert.equal($treeNodes.length, 2);
    assert.equal(findByLabel('view-controller').filter(':last').text().trim(), 'App.SomeController');
  });

});

test("Previewing / showing a view on the client", function(assert) {
  var messageSent = null;
  port.reopen({
    send: function(name, message) {
      messageSent = { name: name, message: message };
    }
  });

  visit('/')
  .then(function() {
    var viewTree = defaultViewTree();
    viewTree.children = [];
    port.trigger('view:viewTree', { tree: viewTree });
    return wait();
  })
  .mouseEnterByLabel('tree-node')
  .then(function() {
    assert.deepEqual(messageSent, { name: 'view:previewLayer', message: { objectId: 'applicationView' } }, "Client asked to preview layer");
  })
  .mouseLeaveByLabel('tree-node')
  .then(function() {
    assert.deepEqual(messageSent, { name: 'view:hidePreview', message: { objectId: 'applicationView' } }, "Client asked to hide preview");
  });
});

test("Inspecting views on hover", function(assert) {
  var messageSent = null;
  port.reopen({
    send: function(name, message) {
      messageSent = { name: name, message: message };
    }
  });

  visit('/')
  .clickByLabel('inspect-views')
  .then(function() {
    assert.equal(messageSent.name, 'view:inspectViews');
    assert.deepEqual(messageSent.message, { inspect: true });
    port.trigger('view:startInspecting');
    return wait();
  })
  .clickByLabel('inspect-views')
  .then(function() {
    assert.equal(messageSent.name, 'view:inspectViews');
    assert.deepEqual(messageSent.message, { inspect: false });
  });
});

test("Configuring which views to show", function(assert) {
  var messageSent = null;
  port.reopen({
    send: function(name, message) {
      messageSent = { name: name, message: message };
    }
  });

  visit('/')
  .then(function() {
    var checkbox = findByLabel('filter-components').find('input');
    checkbox.prop('checked', true);
    checkbox.trigger('change');
    return wait();
  })
  .then(function() {
    assert.equal(messageSent.name, 'view:setOptions');
    assert.deepEqual(messageSent.message.options, { components: true, allViews: false });
    return wait();
  })
  .then(function() {
    var checkbox = findByLabel('filter-all-views').find('input');
    checkbox.prop('checked', true);
    checkbox.trigger('change');
    return wait();
  })
  .then(function() {
    assert.equal(messageSent.name, 'view:setOptions');
    assert.deepEqual(messageSent.message.options, { components: true, allViews: true });
    return wait();
  });
});

test("Inspecting a model", function(assert) {
  let messageSent = null;
  port.reopen({
    send: function(name, message) {
      messageSent = { name: name, message: message };
    }
  });

  visit('/');
  andThen(() => {
    let tree = defaultViewTree();
    run(() => {
      port.trigger('view:viewTree', { tree } );
    });
    return wait();
  });

  andThen(() => {
    let model = findByLabel('view-model-clickable').eq(0);
    return click(model);
  });

  andThen(() => {
    assert.equal(messageSent.name, 'objectInspector:inspectById');
    assert.equal(messageSent.message.objectId, 'postsArray');
  });

});
