import "ember_debug" as EmberDebug;
import "test_app" as App;

EmberDebug.Port = EmberDebug.Port.extend({
  init: function() {},
  send: function() {}
});

var port;

module("Ember Debug", {
  setup: function() {
    App.reset();
    EmberDebug.start();
    port = EmberDebug.port;
  }
});


test("second", function() {
  var name = null, message = null;
  port.reopen({
    send: function(n, m) {
      name = n;
      message = m;
    }
  });

  visit('/posts')
  .then(function() {
    equal(name, 'viewTree');
    var tree = message.tree;
    var value = tree.value;
    equal(message.tree.children.length, 0);
    equal(value.controller, 'posts');
    equal(value.name, 'posts');
    equal(value.tagName, 'div');
    equal(value.template, 'posts');
    equal(value.viewClass, 'Ember.View');
  });
});
