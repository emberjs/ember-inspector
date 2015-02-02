import Ember from "ember";

/* globals require, findByLabel, clickByLabel */
var EmberDebug = require('ember-debug/main')["default"];
var port;
var App, run = Ember.run;
var compile = Ember.Handlebars.compile;
var ObjectController = Ember.ObjectController;
var View = Ember.View;
var Route = Ember.Route;
var EmberObject = Ember.Object;
var OLD_TEMPLATES = {};

function setTemplate(name, template) {
  OLD_TEMPLATES = Ember.TEMPLATES[name];
  Ember.TEMPLATES[name] = compile(template);
}

function destroyTemplates() {
  for (var name in OLD_TEMPLATES) {
    Ember.TEMPLATES[name] = OLD_TEMPLATES[name];
  }
  OLD_TEMPLATES = {};
}

function setupApp(){
  App = Ember.Application.create();
  App.setupForTesting();
  App.injectTestHelpers();


  App.Router.map(function() {
    this.route('simple');
    this.resource('comments', function() {

    });
    this.resource('posts');
  });

  App.SimpleRoute = Route.extend({
    model: function() {
      return EmberObject.create({
        toString: function() {
          return 'Simple Model';
        }
      });
    }
  });

  App.CommentsIndexRoute = Route.extend({
    model: function() {
      return Ember.A(['first comment', 'second comment', 'third comment']);
    }
  });


  App.PostsRoute = Route.extend({
    model: function() {
      return 'String as model';
    }
  });

  App.SimpleController = ObjectController.extend();
  App.SimpleController.reopenClass({
    toString: function() {
      return 'App.SimpleController';
    }
  });

  App.SimpleView = View.extend();
  App.SimpleView.reopenClass({
    toString: function() {
      return 'App.SimpleView';
    }
  });

  setTemplate('application', '{{outlet}}');
  setTemplate('simple', 'Simple {{input class="simple-input"}} {{view "select" classNames="simple-view"}}');
  setTemplate('comments/index', '{{#each}}{{this}}{{/each}}');
  setTemplate('posts', 'Posts');
}

module("View Debug", {
  setup: function() {
    EmberDebug.Port = EmberDebug.Port.extend({
      init: function() {},
      send: function() {}
    });
    run(function() {
      setupApp();
      EmberDebug.set('application', App);
    });
    run(EmberDebug, 'start');
    port = EmberDebug.port;
  },
  teardown: function() {
    EmberDebug.destroyContainer();
    run(App, 'destroy');
    destroyTemplates();
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

  visit('/simple');

  andThen(function() {
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
    equal(findByLabel('layer-view', previewDiv).text(), 'Ember.Select', "Views without controllers can be configured to be highlighted.");
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

test("Supports applications that don't have the ember-application CSS class", function() {
  var name = null, message = null,
      $rootElement = $('body');

  visit('/simple')
  .then(function() {
    ok($rootElement.hasClass('ember-application'), "The rootElement has the .ember-application CSS class");
    $rootElement.removeClass('ember-application');

    // Restart the inspector
    EmberDebug.start();
    port = EmberDebug.port;

    port.reopen({
      send: function(n, m) {
        name = n;
        message = m;
      }
    });
  });
  visit('/simple')
  .then(function() {
    equal(name, 'view:viewTree');
  });
});

test("Does not list nested {{yield}} views", function() {
  var message = null;
  port.reopen({
    send: function(n, m) {
      message = m;
    }
  });

  setTemplate('posts', '{{#x-first}}Foo{{/x-first}}');
  setTemplate('components/x-first', '{{#x-second}}{{yield}}{{/x-second}}');
  setTemplate('components/x-second', '{{yield}}');

  visit('/posts');

  andThen(function() {
    equal(message.tree.children.length, 1, 'Only the posts view should render');
    equal(message.tree.children[0].children.length, 0, 'posts view should have no children');
  });
});
