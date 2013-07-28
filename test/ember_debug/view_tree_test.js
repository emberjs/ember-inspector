import "ember_debug" as EmberDebug;
import "test_app" as App;


var port;

module("View Debug", {

  setup: function() {

    EmberDebug.Port = EmberDebug.Port.extend({
      init: function() {},
      send: function() {}
    });

    App.reset();
    EmberDebug.start();
    port = EmberDebug.port;
  }
});


test("Simple View Tree", function() {
  var name = null, message = null;
  port.reopen({
    send: function(n, m) {
      name = n;
      message = m;
    }
  });

  visit('/simple')
  .then(function() {
    equal(name, 'view:viewTree');
    var tree = message.tree;
    var value = tree.value;
    equal(tree.children.length, 1);
    equal(value.controller, 'application');
    equal(value.name, 'application');
    equal(value.tagName, 'div');
    equal(value.template, 'application');

    var child = tree.children[0];
    var childValue = child.value;
    equal(childValue.controller, 'simple');
    equal(childValue.name, 'simple');
    equal(childValue.tagName, 'div');
    equal(childValue.template, 'simple');
  });
});


test("Highlight a view", function() {
  var name, message, layerDiv;
  port.reopen({
    send: function(n, m) {
      name = n;
      message = m;
    }
  });

  visit('/simple')
  .then(function() {
    var tree = message.tree;
    port.trigger('view:showLayer', {
      objectId: tree.children[0].value.objectId
    });
    return wait();
  })
  .then(function() {
    layerDiv = findByLabel('layer-div');
    ok(layerDiv.is(':visible'));
    equal(findByLabel('layer-template', layerDiv).text(), 'simple');
    equal(findByLabel('layer-controller', layerDiv).text(), 'simple');
    equal(findByLabel('layer-model', layerDiv).text(), 'Simple Model');
    return clickByLabel('layer-controller', layerDiv);
  })
  .then(function() {
    var controller = App.__container__.lookup('controller:simple');
    equal(name, 'objectInspector:updateObject');
    equal(controller.toString(), message.name);
    name = null;
    message = null;
    return clickByLabel('layer-model', layerDiv);
  })
  .then(function() {
    equal(name, 'objectInspector:updateObject');
    equal(message.name, 'Simple Model');
    return clickByLabel('layer-close');
  })
  .then(function() {
    ok(!layerDiv.is(':visible'));
  });
});
