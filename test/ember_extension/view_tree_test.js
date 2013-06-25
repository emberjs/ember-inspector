import "main" as EmberExtension;

var port;

module("viewTree", {
  setup: function() {
    EmberExtension.reset();
    port = EmberExtension.__container__.lookup('port:main');
  }
});

var treeId = 0;
function viewNodeFactory(name) {
  return {
    value: {
      template: name,
      name: name
    },
    children: [],
    treeId: ++treeId
  }
}

function viewTreeFactory() {
  var viewTree = viewNodeFactory('application');
  viewTree.children.push(viewNodeFactory('posts'));
  viewTree.children.push(viewNodeFactory('comments'));
  return viewTree;
}

test("It should request the view tree", function() {
  var viewTree = viewTreeFactory();

  Em.run(function() {
    port.trigger('viewTree', { tree: viewTree } );
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
