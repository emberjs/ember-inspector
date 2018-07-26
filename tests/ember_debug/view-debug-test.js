import { visit, find, click, triggerEvent } from '@ember/test-helpers';
import { A } from '@ember/array';
import { run } from '@ember/runloop';
import Route from '@ember/routing/route';
import EmberObject from '@ember/object';
import Controller from '@ember/controller';
import { inspect } from '@ember/debug';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import require from 'require';
import wait from 'ember-test-helpers/wait';
import { destroyEIApp, setupEIApp } from '../helpers/setup-destroy-ei-app';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';

const EmberDebug = require('ember-debug/main').default;
let port;
let App;

function setTemplate(name, template) {
  template.meta.moduleName = name;
  this.owner.register(`template:${name}`, template);
}

function isVisible(elem) {
  return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
}

function setupApp() {
  this.owner.register('route:application', Route.extend({
    model() {
      return EmberObject.create({
        toString() {
          return 'Application model';
        }
      });
    }
  }));

  this.owner.register('route:simple', Route.extend({
    model() {
      return EmberObject.create({
        toString() {
          return 'Simple Model';
        }
      });
    }
  }));

  this.owner.register('route:comments.index', Route.extend({
    model() {
      return A(['first comment', 'second comment', 'third comment']);
    }
  }));

  this.owner.register('route:posts', Route.extend({
    model() {
      return 'String as model';
    }
  }));

  this.owner.register('controller:application', Controller.extend({
    toString() {
      return 'App.ApplicationController';
    }
  }));

  this.owner.register('controller:simple', Controller.extend({
    toString() {
      return 'App.SimpleController';
    }
  }));

  setTemplate.call(this, 'application', hbs`<div class="application">{{outlet}}</div>`);
  setTemplate.call(this, 'simple', hbs`Simple {{input class="simple-input"}}`);
  setTemplate.call(this, 'comments/index', hbs`{{#each}}{{this}}{{/each}}`);
  setTemplate.call(this, 'posts', hbs`Posts`);
}

module('Ember Debug - View', function(hooks) {
  hooks.beforeEach(async function() {
    EmberDebug.Port = EmberDebug.Port.extend({
      init() {},
      send() {}
    });
    EmberDebug.IGNORE_DEPRECATIONS = true;

    App = await setupEIApp.call(this, EmberDebug, function() {
      this.route('simple');
      this.route('comments', { resetNamespace: true }, function() {});
      this.route('posts', { resetNamespace: true });
    });

    setupApp.call(this);

    port = EmberDebug.port;
  });

  hooks.afterEach(async function() {
    await destroyEIApp.call(this, EmberDebug, App);
  });

  test('Simple View Tree', async function t(assert) {
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
    //TODO: this is almost certainly bugged, we should have a template here, right? Right?!
    // Spoke to rwjblue about this and he is going to work with krisselden on meta versus referrer template name stuff
    if (!hasEmberVersion(3, 1)) {
      assert.equal(value.template, 'application');
    }
  });

  test('Components in view tree', async function t(assert) {
    let message;
    port.reopen({
      send(n, m) {
        message = m;
      }
    });

    await visit('/simple');

    let tree = message.tree;
    let simple = tree.children[0];
    assert.equal(simple.children.length, 0, 'Components are not listed by default.');
    run(() => {
      port.trigger('view:setOptions', { options: { components: true } });
    });

    await wait();

    tree = message.tree;
    simple = tree.children[0];
    assert.equal(simple.children.length, 1, 'Components can be configured to show.');
    let component = simple.children[0];
    // Less than 3.1
    if (!hasEmberVersion(3, 1)) {
      assert.equal(component.value.viewClass, 'Ember.TextField');
    } else {
      // 3.2+
      assert.equal(component.value.viewClass, '@ember/component/text-field');
    }
  });

  test('Highlighting Views on hover', async function t(assert) {
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
    assert.dom('[data-label=layer-component]').doesNotExist('Component layer not shown on outlet views');
    assert.dom(previewDiv.querySelector('[data-label=layer-controller]')).hasText('App.ApplicationController');
    assert.dom(previewDiv.querySelector('[data-label=layer-model]')).hasText('Application model');

    let layerDiv = find('[data-label=layer-div]');
    await triggerEvent(layerDiv, 'mouseup');

    assert.ok(isVisible(layerDiv));
    assert.dom(layerDiv.querySelector('[data-label=layer-model]')).hasText('Application model');
    await click(layerDiv.querySelector('[data-label=layer-controller]'));

    let controller = this.owner.lookup('controller:application');
    assert.equal(name, 'objectInspector:updateObject');
    assert.equal(controller.toString(), message.name);
    name = null;
    message = null;

    await click(layerDiv.querySelector('[data-label=layer-model]'));

    assert.equal(name, 'objectInspector:updateObject');
    assert.equal(message.name, 'Application model');
    await click('[data-label=layer-close]');

    assert.notOk(isVisible(layerDiv));

    run(() => port.trigger('view:inspectViews', { inspect: true }));
    await wait();

    await triggerEvent('.simple-input', 'mousemove');

    previewDiv = find('[data-label=preview-div]');
    assert.ok(isVisible(previewDiv));
    assert.ok(find('[data-label=layer-component]').textContent.trim(), 'Ember.TextField');
    assert.notOk(previewDiv.querySelector('[data-label=layer-controller]'));
    assert.notOk(previewDiv.querySelector('[data-label=layer-model]'));
  });

  test('Highlighting a view without an element should not throw an error', async function t(assert) {
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

    assert.ok(true, 'Does not throw an error.');
  });

  test('Supports a view with a string as model', async function t(assert) {
    let message = null;
    port.reopen({
      send(n, m) {
        message = m;
      }
    });

    await visit('/posts');

    assert.equal(message.tree.children[0].value.model.name, inspect('String as model'));
    assert.equal(message.tree.children[0].value.model.type, 'type-string');
  });

  test('Supports applications that don\'t have the ember-application CSS class', async function t(assert) {
    let name = null;
    let rootElement = document.body;

    await visit('/simple');

    assert.dom(rootElement).hasClass(
      'ember-application',
      'The rootElement has the .ember-application CSS class'
    );
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

  test('Does not list nested {{yield}} views', async function t(assert) {
    let message = null;
    port.reopen({
      send(n, m) {
        message = m;
      }
    });

    setTemplate.call(this, 'posts', hbs`{{#x-first}}Foo{{/x-first}}`);
    setTemplate.call(this, 'components/x-first', hbs`{{#x-second}}{{yield}}{{/x-second}}`);
    setTemplate.call(this, 'components/x-second', hbs`{{yield}}`);

    await visit('/posts');

    assert.equal(message.tree.children.length, 1, 'Only the posts view should render');
    assert.equal(message.tree.children[0].children.length, 0, 'posts view should have no children');
  });
});
