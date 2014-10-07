import EmberDebug from "ember_debug";
import App from "test_app";


var port;

module("View Debug", {

  setup: function() {

    EmberDebug.Port = EmberDebug.Port.extend({
      init: function() {},
      send: function() {}
    });

    EmberDebug.destroyContainer();
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
    equal(value.controller.name, 'Ember.Controller');
    equal(value.viewClass, 'Ember.View');
    equal(value.name, 'application');
    equal(value.tagName, 'div');
    equal(value.template, 'application');

    var child = tree.children[0];
    var childValue = child.value;
    equal(childValue.controller.name, 'App.SimpleController');
    equal(childValue.viewClass, 'App.SimpleView');
    equal(childValue.name, 'simple');
    equal(childValue.tagName, 'div');
    equal(childValue.template, 'simple');
  });
});


test("Views created by {{each}} helper are shown", function() {
  var name = null, message = null;
  port.reopen({
    send: function(n, m) {
      name = n;
      message = m;
    }
  });

  visit('/comments');

  andThen(function() {
    var tree = message.tree;
    var comments = tree.children[0].children;
    equal(comments.length, 3, "There should be 3 views");
    equal(comments[0].value.model.name, 'first comment');
    equal(comments[1].value.model.name, 'second comment');
    equal(comments[2].value.model.name, 'third comment');
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
    equal(findByLabel('layer-controller', layerDiv).text(), 'App.SimpleController');
    equal(findByLabel('layer-model', layerDiv).text(), 'Simple Model');
    equal(findByLabel('layer-view', layerDiv).text(), 'App.SimpleView');
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

test("Components in view tree", function() {
  var name, message;
  port.reopen({
    send: function(n, m) {
      name = n;
      message = m;
    }
  });

  visit('/simple')
  .then(function() {
    var tree = message.tree;
    var simple = tree.children[0];
    equal(simple.children.length, 0, "Components are not listed by default.");
    port.trigger('view:setOptions', { options: { components: true }});
    return wait();
  })
  .then(function() {
    var tree = message.tree;
    var simple = tree.children[0];
    equal(simple.children.length, 1, "Components can be configured to show.");
    var component = simple.children[0];
    equal(component.value.viewClass, 'Ember.TextField');
  });

});

test("Highlighting Views on hover", function() {
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
    port.trigger('view:inspectViews', { inspect: true });
    return wait();
  })
  .then(function() {
    find('.simple-input').trigger('mousemove');
    return wait();
  })
  .then(function() {
    var previewDiv = findByLabel('preview-div');
    ok(previewDiv.is(':visible'));
    equal(findByLabel('layer-component').length, 0, "Components are not Highlighted by default");
    equal(findByLabel('layer-controller', previewDiv).text(), 'App.SimpleController');
    equal(findByLabel('layer-model', previewDiv).text(), 'Simple Model');
    equal(findByLabel('layer-template', previewDiv).text(), 'simple');
    equal(findByLabel('layer-view', previewDiv).text(), 'App.SimpleView');
    port.trigger('view:setOptions', { options: { components: true }});
    return wait();
  })
  .then(function() {
    find('.simple-input').trigger('mousemove');
    return wait();
  })
  .then(function() {
    var previewDiv = findByLabel('preview-div');
    ok(previewDiv.is(':visible'));
    equal(findByLabel('layer-component').text().trim(), "Ember.TextField");
    equal(findByLabel('layer-controller', previewDiv).length, 0);
    equal(findByLabel('layer-model', previewDiv).length, 0);
  })
  .then(function() {
    find('.simple-view').trigger('mousemove');
    return wait();
  })
  .then(function() {
    var previewDiv = findByLabel('preview-div');
    equal(findByLabel('layer-view', previewDiv).text(), 'App.SimpleView', "Views without a controller are not highlighted by default.");
    port.trigger('view:setOptions', { options: { allViews: true }});
    return wait();
  })
  .then(function() {
    find('.simple-view').trigger('mousemove');
    return wait();
  })
  .then(function() {
    var previewDiv = findByLabel('preview-div');
    equal(findByLabel('layer-view', previewDiv).text(), 'Ember.View', "Views without controllers can be configured to be highlighted.");
    port.trigger('view:inspectViews', { inspect: false });
    return wait();
  })
  .then(function() {
    find('.simple-view').trigger('mousemove');
    return wait();
  })
  .then(function() {
    var previewDiv = findByLabel('preview-div');
    ok(!previewDiv.is(':visible'));
  });
});

test("Highlighting a view without an element should not throw an error", function() {
  var name = null, message = null;
  port.reopen({
    send: function(n, m) {
      name = n;
      message = m;
    }
  });

  visit('/posts')
  .then(function() {
    var tree = message.tree;
    var postsView = tree.children[0];
    port.trigger('view:previewLayer', { objectId: postsView.value.objectId });
    return wait();
  })
  .then(function() {
    ok(true, "Does not throw an error.");
  });
});

test("Supports a view with a string as model", function() {
  var name = null, message = null;
  port.reopen({
    send: function(n, m) {
      name = n;
      message = m;
    }
  });

  visit('/posts')
  .then(function() {
    equal(message.tree.children[0].value.model.name, 'String as model');
    equal(message.tree.children[0].value.model.type, 'type-string');
  });
});
