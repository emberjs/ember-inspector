import EmberExtension from "main";

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

test("It should correctly diplay the view tree", function() {
  var viewTree = viewTreeFactory({
    name: 'application',
    children: [ { name: 'posts' }, { name: 'comments' } ]
  });

  Em.run(function() {
    port.trigger('view:viewTree', { tree: viewTree } );
  });


  visit('/')
  .then(function() {
    var $treeNodes = findByLabel('tree-node');
    equal($treeNodes.length, 2);
    var $treeViews = findByLabel('tree-view');
    equal($treeViews.length, 3);
    var $treeView = $treeViews.filter(':first');
    var controllerNames = [];
    var templateNames = [];
    $treeViews.each(function() {
      controllerNames.push(findByLabel('tree-view-controller', this).filter(':first').text());
      templateNames.push(findByLabel('tree-view-template', this).filter(':first').text());
    });
    deepEqual(controllerNames, ['application', 'posts', 'comments']);
    deepEqual(templateNames, ['template:application', 'template:posts', 'template:comments']);
  });

});

test("It should update the view tree when the port triggers a change", function() {
  expect(4);
  var $treeNodes, viewTree;

  visit('/')
  .then(function() {
    viewTree = viewTreeFactory({
      name: 'application',
      children: [ { name: 'posts' }]
    });
    port.trigger('view:viewTree', { tree: viewTree });
    return wait();

  })
  .then(function() {

    $treeNodes = findByLabel('tree-node');
    equal($treeNodes.length, 2);
    equal(findByLabel('tree-view-controller').filter(':last').text(), 'posts');

    viewTree = viewTreeFactory({ name: 'comments', children: [] });
    port.trigger('view:viewTree', { tree: viewTree });
    return wait();

  })
  .then(function() {

    $treeNodes = findByLabel('tree-node');
    equal($treeNodes.length, 1);
    equal(findByLabel('tree-view-controller').text(), 'comments');
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
    var viewTree = viewTreeFactory({ name: 'application', objectId: 1 });
    port.trigger('view:viewTree', { tree: viewTree });
    return wait();
  })
  .mouseEnterByLabel('tree-view-controller')
  .then(function() {
    deepEqual(messageSent, { name: 'view:previewLayer', message: { objectId: 1 } } , "Client asked to preview layer");
  })
  .mouseLeaveByLabel('tree-view-controller')
  .then(function() {
    deepEqual(messageSent, { name: 'view:hidePreview', message: { objectId: 1 } } , "Client asked to hide preview");
  })
  .clickByLabel('tree-view-controller')
  .then(function() {
    deepEqual(messageSent, { name: 'view:showLayer', message: { objectId: 1 } } , "Client asked to pin layer");
    ok(findByLabel('tree-view-controller').hasClass('is-pinned'), "View is pinned");
    messageSent = null;
  })
  .mouseEnterByLabel('tree-view-controller')
  .then(function() {
    equal(messageSent, null, "Client not asked to preview when view already pinned");
  });
});
