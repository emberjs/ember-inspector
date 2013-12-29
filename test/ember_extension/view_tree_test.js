var port;

module("viewTree", {
  setup: function() {
    EmberExtension.reset();
    port = EmberExtension.__container__.lookup('port:main');
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
    controller: {
      name: 'App.ApplicationController',
      objectId: 'applicationController'
    },
    children: [
      {
        name: 'posts',
        isVirtual: false,
        isComponent: false,
        viewClass: 'App.PostsView',
        objectId: 'postsView',
        model: {
          name: 'PostsArray',
          objectId: 'postsArray'
        },
        controller: {
          name: 'App.PostsController',
          objectId: 'postsController'
        },
        children: []
      },
      {
        name: 'comments',
        isVirtual: false,
        isComponent: false,
        viewClass: 'App.CommentsView',
        objectId: 'commentsView',
        model: {
          name: 'CommentsArray',
          objectId: 'commentsArray'
        },
        controller: {
          name: 'App.CommentsController',
          objectId: 'commentsController'
        },
        children: []
      }
    ]
  });
}

test("It should correctly diplay the view tree", function() {
  var viewTree = defaultViewTree();

  visit('/')
  .then(function() {
    port.trigger('view:viewTree', { tree: viewTree } );
    return wait();
  })
  .then(function() {
    var $treeNodes = findByLabel('tree-node');
    equal($treeNodes.length, 3);
    var $treeView = $treeNodes.filter(':first');
    var controllerNames = [],
        templateNames = [],
        modelNames = [],
        viewClassNames = [];

    $treeNodes.each(function() {
      templateNames.push(findByLabel('view-template', this).filter(':first').text().trim());
      controllerNames.push(findByLabel('view-controller', this).filter(':first').text().trim());
      viewClassNames.push(findByLabel('view-class', this).filter(':first').text().trim());
      modelNames.push(findByLabel('view-model', this).filter(':first').text().trim());
    });
    deepEqual(controllerNames, ['App.ApplicationController', 'App.PostsController', 'App.CommentsController']);
    deepEqual(templateNames, ['application', 'posts', 'comments']);
    deepEqual(modelNames, ['--', 'PostsArray', 'CommentsArray']);
    deepEqual(viewClassNames, ['App.ApplicationView', 'App.PostsView', 'App.CommentsView']);
  });

});

test("It should update the view tree when the port triggers a change", function() {
  expect(4);
  var $treeNodes, viewTree = defaultViewTree();

  visit('/')
  .then(function() {
    port.trigger('view:viewTree', { tree: viewTree });
    return wait();

  })
  .then(function() {

    $treeNodes = findByLabel('tree-node');
    equal($treeNodes.length, 3);
    equal(findByLabel('view-controller').filter(':last').text().trim(), 'App.CommentsController');

    viewTree = defaultViewTree();
    viewTree.children.splice(0, 1);
    viewTree.children[0].value.controller.name = 'App.SomeController';

    port.trigger('view:viewTree', { tree: viewTree });
    return wait();

  })
  .then(function() {

    $treeNodes = findByLabel('tree-node');
    equal($treeNodes.length, 2);
    equal(findByLabel('view-controller').filter(':last').text().trim(), 'App.SomeController');
  });

});

test("Previewing / showing a view on the client", function() {
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
    deepEqual(messageSent, { name: 'view:previewLayer', message: { objectId: 'applicationView' } } , "Client asked to preview layer");
  })
  .mouseLeaveByLabel('tree-node')
  .then(function() {
    deepEqual(messageSent, { name: 'view:hidePreview', message: { objectId: 'applicationView' } } , "Client asked to hide preview");
  });
});

test("Inspecting views on hover", function() {
  var messageSent = null;
  port.reopen({
    send: function(name, message) {
      messageSent = { name: name, message: message };
    }
  });

  visit('/')
  .clickByLabel('inspect-views')
  .then(function() {
    equal(messageSent.name, 'view:inspectViews');
    deepEqual(messageSent.message, { inspect: true });
    port.trigger('view:startInspecting');
    return wait();
  })
  .clickByLabel('inspect-views')
  .then(function() {
    equal(messageSent.name, 'view:inspectViews');
    deepEqual(messageSent.message, { inspect: false });
  });
});

test("Configuring which views to show", function() {
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
    equal(messageSent.name, 'view:setOptions');
    deepEqual(messageSent.message.options, { components: true, allViews: false });
    return wait();
  })
  .then(function() {
    var checkbox = findByLabel('filter-all-views').find('input');
    checkbox.prop('checked', true);
    checkbox.trigger('change');
    return wait();
  })
  .then(function() {
    equal(messageSent.name, 'view:setOptions');
    deepEqual(messageSent.message.options, { components: true, allViews: true });
    return wait();
  });
});
