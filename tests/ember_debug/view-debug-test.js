import Ember from "ember";
import { module, test } from 'qunit';
import { visit, find, click, triggerEvent, settings as nativeDomHelpersSettings } from 'ember-native-dom-helpers';
import hbs from 'htmlbars-inline-precompile';
import require from 'require';

const { Application } = Ember;

const EmberDebug = require('ember-debug/main').default;
const { Route, Object: EmberObject, Controller } = Ember;
let port;
let App, run = Ember.run;
let OLD_TEMPLATES = {};

function setTemplate(name, template) {
  OLD_TEMPLATES = Ember.TEMPLATES[name];
  template.meta.moduleName = name;
  Ember.TEMPLATES[name] = template;
}

function destroyTemplates() {
  for (let name in OLD_TEMPLATES) {
    Ember.TEMPLATES[name] = OLD_TEMPLATES[name];
  }
  OLD_TEMPLATES = {};
}

function isVisible(elem) {
  return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
}

function setupApp() {
  App = Application.create();
  App.setupForTesting();
  App.injectTestHelpers();


  App.Router.map(function() {
    this.route('simple');
    this.route('comments', { resetNamespace: true }, function() {});
    this.route('posts', { resetNamespace: true });
  });

  App.ApplicationRoute = Route.extend({
    model() {
      return EmberObject.create({
        toString() {
          return 'Application model';
        }
      });
    }
  });

  App.SimpleRoute = Route.extend({
    model() {
      return EmberObject.create({
        toString() {
          return 'Simple Model';
        }
      });
    }
  });

  App.CommentsIndexRoute = Route.extend({
    model() {
      return Ember.A(['first comment', 'second comment', 'third comment']);
    }
  });

  App.PostsRoute = Route.extend({
    model() {
      return 'String as model';
    }
  });

  App.ApplicationController = Controller.extend();
  App.ApplicationController.reopenClass({
    toString() {
      return 'App.ApplicationController';
    }
  });
  App.SimpleController = Controller.extend();
  App.SimpleController.reopenClass({
    toString() {
      return 'App.SimpleController';
    }
  });

  setTemplate('application', hbs`<div class="application">{{outlet}}</div>`);
  setTemplate('simple', hbs`Simple {{input class="simple-input"}}`);
  setTemplate('comments/index', hbs`{{#each}}{{this}}{{/each}}`);
  setTemplate('posts', hbs`Posts`);
}
let defaultRootForFinder;

module("View Debug", function(hooks) {
  hooks.beforeEach(function() {
    EmberDebug.Port = EmberDebug.Port.extend({
      init() {},
      send() {}
    });
    run(function() {
      setupApp();
      EmberDebug.set('owner', App.__deprecatedInstance__);
    });
    EmberDebug.IGNORE_DEPRECATIONS = true;
    run(EmberDebug, 'start');
    port = EmberDebug.port;
    defaultRootForFinder = nativeDomHelpersSettings.rootElement;
    nativeDomHelpersSettings.rootElement = 'body';
  });

  hooks.afterEach(function() {
    EmberDebug.destroyContainer();
    run(App, 'destroy');
    destroyTemplates();
    nativeDomHelpersSettings.rootElement = defaultRootForFinder;
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
    assert.equal(value.controller.name, 'App.ApplicationController');
    assert.equal(value.name, 'application');
    assert.equal(value.tagName, 'div');
    assert.equal(value.template, 'application');
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
    let name, message;
    port.reopen({
      send(n, m) {
        name = n;
        message = m;
      }
    });

    await visit('/simple');

    run(() => port.trigger('view:inspectViews', { inspect: true }));
    await wait();

    await triggerEvent('.application', 'mousemove');

    let previewDiv = find('[data-label=preview-div]');

    assert.ok(isVisible(previewDiv));
    assert.notOk(find('[data-label=layer-component]'), "Component layer not shown on outlet views");
    assert.equal(find('[data-label=layer-controller]', previewDiv).textContent, 'App.ApplicationController');
    assert.equal(find('[data-label=layer-model]', previewDiv).textContent, 'Application model');

    let layerDiv = find('[data-label=layer-div]');
    await triggerEvent(layerDiv, 'mouseup');

    assert.ok(isVisible(layerDiv));
    assert.equal(find('[data-label=layer-model]', layerDiv).textContent, 'Application model');
    await click('[data-label=layer-controller]', layerDiv);

    let controller = App.__container__.lookup('controller:application');
    assert.equal(name, 'objectInspector:updateObject');
    assert.equal(controller.toString(), message.name);
    name = null;
    message = null;

    await click('[data-label=layer-model]', layerDiv);

    assert.equal(name, 'objectInspector:updateObject');
    assert.equal(message.name, 'Application model');
    await click('[data-label=layer-close]');

    assert.notOk(isVisible(layerDiv));

    run(() => port.trigger('view:inspectViews', { inspect: true }));
    await wait();

    await triggerEvent('.simple-input', 'mousemove');

    previewDiv = find('[data-label=preview-div]');
    assert.ok(isVisible(previewDiv));
    assert.equal(find('[data-label=layer-component]').textContent.trim(), "Ember.TextField");
    assert.notOk(find('[data-label=layer-controller]', previewDiv));
    assert.notOk(find('[data-label=layer-model]', previewDiv));
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
    let name = null;
    let rootElement = find('');

    await visit('/simple');

    assert.ok(rootElement.classList.contains('ember-application'), "The rootElement has the .ember-application CSS class");
    rootElement.classList.remove('ember-application');

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

    setTemplate('posts', hbs`{{#x-first}}Foo{{/x-first}}`);
    setTemplate('components/x-first', hbs`{{#x-second}}{{yield}}{{/x-second}}`);
    setTemplate('components/x-second', hbs`{{yield}}`);

    await visit('/posts');

    assert.equal(message.tree.children.length, 1, 'Only the posts view should render');
    assert.equal(message.tree.children[0].children.length, 0, 'posts view should have no children');
  });
});
