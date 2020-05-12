import {
  click,
  find,
  triggerEvent,
  visit
} from '@ember/test-helpers';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import { A } from '@ember/array';
import { run } from '@ember/runloop';
import EmberComponent from '@ember/component';
import EmberRoute from '@ember/routing/route';
import EmberObject from '@ember/object';
import Controller from '@ember/controller';
import QUnit, { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import { destroyEIApp, setupEIApp } from '../helpers/setup-destroy-ei-app';
import EmberDebug from 'ember-debug/main';

let port;
let App;

// TODO make the debounce configurable for tests
async function timeout(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

// TODO switch to an adapter architecture, similar to the acceptance tests
async function captureMessage(type, callback) {
  if (!port) {
    throw new Error('Cannot call captureMessage without a port');
  }

  let send = port.send;

  try {
    let captured;

    port.send = (name, message) => {
      if (!captured && name === type) {
        captured = message;
      } else {
        send.call(port, name, message);
      }
    };

    await callback();

    if (captured) {
      return captured;
    } else {
      throw new Error(`Did not send a message of type ${type}`);
    }
  } finally {
    port.send = send;
  }
}

async function getRenderTree() {
  let message = await captureMessage('view:renderTree', async () => {
    port.trigger('view:getTree', {});
    await timeout(300);
  });

  if (message) {
    return message.tree;
  }
}

function isVisible(element) {
  let { width, height } = element.getBoundingClientRect();
  return width > 0 && height > 0;
}

function setupApp() {
  this.owner.register('route:application', EmberRoute.extend({
    model() {
      return EmberObject.create({
        toString() {
          return 'Application model';
        }
      });
    }
  }));

  this.owner.register('route:simple', EmberRoute.extend({
    model() {
      return EmberObject.create({
        toString() {
          return 'Simple Model';
        }
      });
    }
  }));

  this.owner.register('route:comments.index', EmberRoute.extend({
    model() {
      return A(['first comment', 'second comment', 'third comment']);
    }
  }));

  this.owner.register('route:posts', EmberRoute.extend({
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

  this.owner.register('component:test-foo', EmberComponent.extend({
    classNames: ['simple-component'],
    toString() {
      return 'App.TestFooComponent';
    }
  }));

  this.owner.register('component:test-bar', EmberComponent.extend({
    tagName: '',
    toString() {
      return 'App.TestBarComponent';
    }
  }));

  /*
    Setting line-height to normal because normalize.css sets the
    html line-height to 1.15. This seems to cause a measurement
    error with getBoundingClientRect
  */
  this.owner.register('template:application', hbs('<div class="application" style="line-height: normal;">{{outlet}}</div>', { moduleName: 'my-app/templates/application.hbs' }));
  this.owner.register('template:simple', hbs('Simple {{test-foo}} {{test-bar}}', { moduleName: 'my-app/templates/simple.hbs' }));
  this.owner.register('template:comments/index', hbs('{{#each this.comments as |comment|}}{{comment}}{{/each}}', { moduleName: 'my-app/templates/comments/index.hbs' }));
  this.owner.register('template:posts', hbs('Posts', { moduleName: 'my-app/templates/posts.hbs' }));
  this.owner.register('template:components/test-foo', hbs('test-foo', { moduleName: 'my-app/templates/components/test-foo.hbs' }));
  this.owner.register('template:components/test-bar', hbs('<!-- before --><div class="another-component"><span>test</span> <span class="bar-inner">bar</span></div><!-- after -->', { moduleName: 'my-app/templates/components/test-bar.hbs' }));
}

function matchTree(tree, matchers) {
  QUnit.assert.equal(tree.length, matchers.length, 'tree and matcher should have the same length');

  for (let i = 0; i < matchers.length; i++) {
    match(tree[i], matchers[i]);
  }
}

function match(actual, matcher) {
  if (typeof matcher === 'function') {
    matcher(actual);
  } else if (Array.isArray(matcher)) {
    QUnit.assert.ok(matcher.indexOf(actual) > -1, `${actual} should be one of ${matcher.join('/')}`);
  } else if (matcher instanceof RegExp) {
    QUnit.assert.ok(actual.match(matcher), `${actual} should match ${matcher}`);
  } else if(matcher !== null && typeof matcher === 'object') {
    QUnit.assert.deepEqual(actual, matcher);
  } else {
    QUnit.assert.strictEqual(actual, matcher);
  }
}

function Any() {
  return () => {};
}

function Eq(item) {
  return actual => {
    QUnit.assert.strictEqual(actual, item);
  }
}

function Undefined() {
  return Eq(undefined);
}

function Serialized(id) {
  return actual => {
    QUnit.assert.ok(typeof actual === 'object' && actual !== null, 'serialized object should be an object');
    QUnit.assert.ok(typeof actual.id === 'string', 'serialized object should have a string id');

    if (id === undefined) {
      QUnit.assert.ok(actual.id.match(/^ember[0-9]+$/), 'serialized object should have an ember guid');
    } else {
      QUnit.assert.equal(actual.id, id, 'serialized object should have an ember guid');
    }
  };
}

function RenderNodeID(id) {
  return actual => {
    QUnit.assert.ok(typeof actual === 'string', 'render node id should be a string');

    if (id === undefined) {
      QUnit.assert.ok(actual.match(/^render-node:.+$/), 'render node id should have the right format');
    } else {
      QUnit.assert.equal(actual, id, 'render node id should match');
    }
  };
}

function Args({ names = [], positionals = 0 } = {}) {
  return actual => {
    QUnit.assert.ok(typeof actual === 'object' && actual !== null, 'serialized args should be an object');

    QUnit.assert.ok(typeof actual.named === 'object' && actual !== null, 'serialized named args should be an object');
    QUnit.assert.deepEqual(Object.keys(actual.named), names, 'serialized named args should have the right keys');

    QUnit.assert.ok(Array.isArray(actual.positional), 'serialized positional args should be an array');
    QUnit.assert.strictEqual(actual.positional.length, positionals, 'serialized positional args should have the right number of items');
  };
}

function RenderNode({
  id = RenderNodeID(),
  type,
  name,
  args = Args(),
  instance = Any(),
  template = /^.+\.hbs$/,
  bounds = ['single', 'range', null]
}, ...children) {
  return actual => {
    match(actual.id, id);
    match(actual.type, type);
    match(actual.name, name);
    match(actual.args, args);
    match(actual.instance, instance);
    match(actual.template, template);
    match(actual.bounds, bounds);
    matchTree(actual.children, children);
  };
}

function Component({
  name,
  instance = Serialized(),
  template = `my-app/templates/components/${name}.hbs`,
  bounds = 'single',
  ...options
}, ...children) {
  return RenderNode({ name, instance, template, bounds, ...options, type: 'component' },
    ...children
  );
}

function Route({
  name,
  args = hasEmberVersion(3, 14) ? Args({ names: ['model'] }) : Args(),
  instance = Serialized(),
  template = `my-app/templates/${name}.hbs`,
  ...options
}, ...children) {
  return RenderNode({ type: 'outlet', name: 'main', instance: undefined, template: null },
    RenderNode({ name, args, instance, template, ...options, type: 'route-template' },
      ...children
    )
  );
}

function TopLevel(...children) {
  return Route({
    name: '-top-level',
    args: Args(),
    instance: Undefined(),
    template: /^packages\/.+\/templates\/outlet\.hbs$/,
  }, ...children);
}

function findInspectorElement(kind) {
  for(let element of document.body.children) {
    if (element.id.startsWith(`ember-inspector-${kind}-`)) {
      return element;
    }
  }

  throw new Error(`Cannot find ${kind} inspector element`);
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

  test('Simple View Tree', async function() {
    await visit('/simple');

    let tree = await getRenderTree();

    matchTree(tree, [
      TopLevel(
        Route({ name: 'application' },
          Route({ name: 'simple' },
            Component({ name: 'test-foo', bounds: 'single' }),
            Component({ name: 'test-bar', bounds: 'range' })
          )
        )
      )
    ]);
  });

  test('Supports applications that don\'t have the ember-application CSS class', async function(assert) {
    await visit('/simple');

    assert.dom(this.element).hasClass(
      'ember-application',
      'The rootElement has the .ember-application CSS class'
    );

    this.element.classList.remove('ember-application');

    // Restart the inspector
    EmberDebug.start();
    port = EmberDebug.port;

    await visit('/simple');

    assert.dom(this.element).doesNotHaveClass(
      'ember-application',
      'The rootElement no longer has the .ember-application CSS class'
    );

    let tree = await getRenderTree();

    matchTree(tree, [
      TopLevel(
        Route({ name: 'application' },
          Route({ name: 'simple' },
            Component({ name: 'test-foo', bounds: 'single' }),
            Component({ name: 'test-bar', bounds: 'range' })
          )
        )
      )
    ]);
  });

  test('Does not list nested {{yield}} views', async function() {
    this.owner.register('component:x-first', EmberComponent.extend());
    this.owner.register('component:x-second', EmberComponent.extend());

    this.owner.register('template:posts', hbs('{{#x-first}}Foo{{/x-first}}', { moduleName: 'my-app/templates/posts.hbs' }));
    this.owner.register('template:components/x-first', hbs('{{#x-second}}{{yield}}{{/x-second}}', { moduleName: 'my-app/templates/components/x-first.hbs' }));
    this.owner.register('template:components/x-second', hbs('{{yield}}', { moduleName: 'my-app/templates/components/x-second.hbs' }));

    await visit('/posts');

    let tree = await getRenderTree();

    matchTree(tree, [
      TopLevel(
        Route({ name: 'application' },
          Route({ name: 'posts' },
            Component({ name: 'x-first' },
              Component({ name: 'x-second' })
            )
          )
        )
      )
    ]);
  });

  test('Highlighting Views on hover', async function(assert) {
    await visit('/simple');
    await getRenderTree();

    let foo = find('.simple-component');
    let bar = find('.another-component');
    let tooltip = findInspectorElement('tooltip');
    let highlight = findInspectorElement('highlight');

    assert.ok(!isVisible(tooltip), 'tooltip is not visible');
    assert.ok(!isVisible(highlight), 'highlight is not visible');

    run(() => port.trigger('view:inspectViews', { inspect: true }));

    await triggerEvent('.simple-component', 'mousemove');

    assert.ok(isVisible(tooltip), 'tooltip is visible');
    assert.dom('.ember-inspector-tooltip-header', tooltip).hasText('<TestFoo>');
    assert.dom('.ember-inspector-tooltip-detail-template', tooltip).hasText('my-app/templates/components/test-foo.hbs');
    assert.dom('.ember-inspector-tooltip-detail-instance', tooltip).hasText('App.TestFooComponent');

    let actual = highlight.getBoundingClientRect();
    let expected = foo.getBoundingClientRect();

    assert.ok(isVisible(highlight), 'highlight is visible');
    assert.equal(actual.x, expected.x, 'same x as component');
    assert.equal(actual.y, expected.y, 'same y as component');
    assert.equal(actual.width, expected.width, 'same width as component');
    assert.equal(actual.height, expected.height, 'same height as component');

    await triggerEvent('.bar-inner', 'mousemove');

    assert.ok(isVisible(tooltip), 'tooltip is visible');
    assert.dom('.ember-inspector-tooltip-header', tooltip).hasText('<TestBar>');
    assert.dom('.ember-inspector-tooltip-detail-template', tooltip).hasText('my-app/templates/components/test-bar.hbs');
    assert.dom('.ember-inspector-tooltip-detail-instance', tooltip).hasText('App.TestBarComponent');

    actual = highlight.getBoundingClientRect();
    expected = bar.getBoundingClientRect();

    assert.ok(isVisible(highlight), 'highlight is visible');
    assert.equal(actual.x, expected.x, 'same x as component');
    assert.equal(actual.y, expected.y, 'same y as component');
    assert.equal(actual.width, expected.width, 'same width as component');
    assert.equal(actual.height, expected.height, 'same height as component');

    await triggerEvent(document.body, 'mousemove');

    assert.ok(!isVisible(tooltip), 'tooltip is not visible');
    assert.ok(!isVisible(highlight), 'highlight is not visible');

    // Pin tooltip and stop inspecting
    await click('.simple-component');
    await triggerEvent('.bar-inner', 'mousemove');

    assert.ok(isVisible(tooltip), 'tooltip is visible');
    assert.dom('.ember-inspector-tooltip-header', tooltip).hasText('<TestFoo>');
    assert.dom('.ember-inspector-tooltip-detail-template', tooltip).hasText('my-app/templates/components/test-foo.hbs');
    assert.dom('.ember-inspector-tooltip-detail-instance', tooltip).hasText('App.TestFooComponent');

    actual = highlight.getBoundingClientRect();
    expected = foo.getBoundingClientRect();

    assert.ok(isVisible(highlight), 'highlight is visible');
    assert.equal(actual.x, expected.x, 'same x as component');
    assert.equal(actual.y, expected.y, 'same y as component');
    assert.equal(actual.width, expected.width, 'same width as component');
    assert.equal(actual.height, expected.height, 'same height as component');

    assert.ok(isVisible(tooltip), 'tooltip is visible');
    assert.dom('.ember-inspector-tooltip-header', tooltip).hasText('<TestFoo>');
    assert.dom('.ember-inspector-tooltip-detail-template', tooltip).hasText('my-app/templates/components/test-foo.hbs');
    assert.dom('.ember-inspector-tooltip-detail-instance', tooltip).hasText('App.TestFooComponent');

    await triggerEvent(this.element, 'mousemove');

    assert.ok(isVisible(tooltip), 'tooltip is pinned');
    assert.ok(isVisible(highlight), 'highlight is pinned');

    // TODO support clicking on the instance to open object inspector

    // Dismiss tooltip
    await click(this.element);

    assert.ok(!isVisible(tooltip), 'tooltip is not visible');
    assert.ok(!isVisible(highlight), 'highlight is not visible');

    await triggerEvent('.bar-inner', 'mousemove');

    assert.ok(!isVisible(tooltip), 'tooltip is not visible');
    assert.ok(!isVisible(highlight), 'highlight is not visible');
  });
});
