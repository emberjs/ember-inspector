/* jshint ignore:start */
import Ember from "ember";
import { module, test } from 'qunit';
const { $ } = Ember;

/* globals require, findByLabel, clickByLabel */
var EmberDebug = require('ember-debug/main').default;
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
  Ember.TEMPLATES[name] = compile(template, { moduleName: name });
}

function destroyTemplates() {
  for (var name in OLD_TEMPLATES) {
    Ember.TEMPLATES[name] = OLD_TEMPLATES[name];
  }
  OLD_TEMPLATES = {};
}

function setupApp() {
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
  beforeEach() {
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
  afterEach() {
    EmberDebug.destroyContainer();
    run(App, 'destroy');
    destroyTemplates();
  }
});

test("Simple View Tree", async function t(assert) {
  let name = null, message = null;
  port.reopen({
    send(n, m) {
      name = n;
      message = m;
    }
  });

  await visit('/simple');

  assert.equal(name, 'view:viewTree');
  let tree = message.tree;
  let value = tree.value;
  assert.equal(tree.children.length, 1);
  assert.equal(value.controller.name, 'Ember.Controller');
  assert.equal(value.viewClass, 'Ember.View');
  assert.equal(value.name, 'application');
  assert.equal(value.tagName, 'div');
  assert.equal(value.template, 'application');

  let child = tree.children[0];
  let childValue = child.value;
  assert.equal(childValue.controller.name, 'App.SimpleController');
  assert.equal(childValue.viewClass, 'App.SimpleView');
  assert.equal(childValue.name, 'simple');
  assert.equal(childValue.tagName, 'div');
  assert.equal(childValue.template, 'simple');
});


test("Views created by context switching {{each}} helper are shown", async function t(assert) {
  let message = null;
  port.reopen({
    send(n, m) {
      message = m;
    }
  });

  // Disable deprecation warning of context switching each helper
  const originalDeprecate = Ember.deprecate;
  Ember.deprecate = Ember.K;
  await visit('/comments');

  Ember.deprecate = originalDeprecate;
  let tree = message.tree;
  let comments = tree.children[0].children;
  assert.equal(comments.length, 3, "There should be 3 views");
  assert.equal(comments[0].value.model.name, 'first comment');
  assert.equal(comments[1].value.model.name, 'second comment');
  assert.equal(comments[2].value.model.name, 'third comment');
});


test("Highlight a view", async function t(assert) {
  let name, message, layerDiv;
  port.reopen({
    send(n, m) {
      name = n;
      message = m;
    }
  });

  await visit('/simple');
  let tree = message.tree;
  port.trigger('view:showLayer', {
    objectId: tree.children[0].value.objectId
  });
  await wait();
  layerDiv = findByLabel('layer-div');
  assert.ok(layerDiv.is(':visible'));
  assert.equal(findByLabel('layer-template', layerDiv).text(), 'simple');
  assert.equal(findByLabel('layer-controller', layerDiv).text(), 'App.SimpleController');
  assert.equal(findByLabel('layer-model', layerDiv).text(), 'Simple Model');
  assert.equal(findByLabel('layer-view', layerDiv).text(), 'App.SimpleView');

  await clickByLabel('layer-controller', layerDiv);

  let controller = App.__container__.lookup('controller:simple');
  assert.equal(name, 'objectInspector:updateObject');
  assert.equal(controller.toString(), message.name);
  name = null;
  message = null;

  await clickByLabel('layer-model', layerDiv);

  assert.equal(name, 'objectInspector:updateObject');
  assert.equal(message.name, 'Simple Model');

  await clickByLabel('layer-close');

  assert.ok(!layerDiv.is(':visible'));
});

test("Components in view tree", async function t(assert) {
  let message;
  port.reopen({
    send(n, m) {
      message = m;
    }
  });

  await visit('/simple');

  let tree = message.tree;
  let simple = tree.children[0];
  assert.equal(simple.children.length, 0, "Components are not listed by default.");
  run(() => {
    port.trigger('view:setOptions', { options: { components: true } });
  });

  await wait();

  tree = message.tree;
  simple = tree.children[0];
  assert.equal(simple.children.length, 1, "Components can be configured to show.");
  let component = simple.children[0];
  assert.equal(component.value.viewClass, 'Ember.TextField');

});

test("Highlighting Views on hover", async function t(assert) {
  port.reopen({
    send(/*n, m*/) {}
  });

  await visit('/simple');

  run(() => port.trigger('view:inspectViews', { inspect: true }));
  await wait();

  run(() => find('.simple-input').trigger('mousemove'));
  await wait();

  let previewDiv = findByLabel('preview-div');
  assert.ok(previewDiv.is(':visible'));
  assert.equal(findByLabel('layer-component').length, 0, "Components are not Highlighted by default");
  assert.equal(findByLabel('layer-controller', previewDiv).text(), 'App.SimpleController');
  assert.equal(findByLabel('layer-model', previewDiv).text(), 'Simple Model');
  assert.equal(findByLabel('layer-template', previewDiv).text(), 'simple');
  assert.equal(findByLabel('layer-view', previewDiv).text(), 'App.SimpleView');
  run(() => port.trigger('view:setOptions', { options: { components: true } }));
  await wait();

  run(() => find('.simple-input').trigger('mousemove'));
  await wait();

  previewDiv = findByLabel('preview-div');
  assert.ok(previewDiv.is(':visible'));
  assert.equal(findByLabel('layer-component').text().trim(), "Ember.TextField");
  assert.equal(findByLabel('layer-controller', previewDiv).length, 0);
  assert.equal(findByLabel('layer-model', previewDiv).length, 0);

  run(() => find('.simple-view').trigger('mousemove'));
  await wait();

  previewDiv = findByLabel('preview-div');
  assert.equal(findByLabel('layer-view', previewDiv).text(), 'App.SimpleView', "Views without a controller are not highlighted by default.");
  run(() => port.trigger('view:setOptions', { options: { allViews: true } }));
  await wait();

  find('.simple-view').trigger('mousemove');
  await wait();

  previewDiv = findByLabel('preview-div');
  assert.equal(findByLabel('layer-view', previewDiv).text(), 'Ember.Select', "Views without controllers can be configured to be highlighted.");
  run(() => port.trigger('view:inspectViews', { inspect: false }));
  await wait();

  run(() => find('.simple-view').trigger('mousemove'));
  await wait();

  previewDiv = findByLabel('preview-div');
  assert.ok(!previewDiv.is(':visible'));
});

test("Highlighting a view without an element should not throw an error", async function t(assert) {
  let message = null;
  port.reopen({
    send(n, m) {
      message = m;
    }
  });

  await visit('/posts');

  let tree = message.tree;
  let postsView = tree.children[0];
  port.trigger('view:previewLayer', { objectId: postsView.value.objectId });
  await wait();

  assert.ok(true, "Does not throw an error.");
});

test("Supports a view with a string as model", async function t(assert) {
  let message = null;
  port.reopen({
    send(n, m) {
      message = m;
    }
  });

  await visit('/posts');

  assert.equal(message.tree.children[0].value.model.name, 'String as model');
  assert.equal(message.tree.children[0].value.model.type, 'type-string');
});

test("Supports applications that don't have the ember-application CSS class", async function t(assert) {
  let name = null,
      $rootElement = $('body');

  await visit('/simple');

  assert.ok($rootElement.hasClass('ember-application'), "The rootElement has the .ember-application CSS class");
  $rootElement.removeClass('ember-application');

  // Restart the inspector
  EmberDebug.start();
  port = EmberDebug.port;

  port.reopen({
    send(n/*, m*/) {
      name = n;
    }
  });

  await visit('/simple');

  assert.equal(name, 'view:viewTree');
});

test("Does not list nested {{yield}} views", async function t(assert) {
  let message = null;
  port.reopen({
    send(n, m) {
      message = m;
    }
  });

  setTemplate('posts', '{{#x-first}}Foo{{/x-first}}');
  setTemplate('components/x-first', '{{#x-second}}{{yield}}{{/x-second}}');
  setTemplate('components/x-second', '{{yield}}');

  await visit('/posts');

  assert.equal(message.tree.children.length, 1, 'Only the posts view should render');
  assert.equal(message.tree.children[0].children.length, 0, 'posts view should have no children');
});
