/* eslint-disable ember/no-classic-classes */
import {
  click,
  find,
  rerender,
  triggerEvent,
  visit,
} from '@ember/test-helpers';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import { A } from '@ember/array';
import { run } from '@ember/runloop';
// eslint-disable-next-line ember/no-classic-components
import EmberComponent, { setComponentTemplate } from '@ember/component';
import EmberRoute from '@ember/routing/route';
import EmberObject from '@ember/object';
import Controller from '@ember/controller';
// eslint-disable-next-line ember/no-at-ember-render-modifiers
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
import QUnit, { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import EmberDebug from 'ember-debug/main';
import setupEmberDebugTest from '../helpers/setup-ember-debug-test';
import { isInVersionSpecifier } from 'ember-debug/version';
import { VERSION } from 'ember-debug/ember';

let templateOnlyComponent = null;
try {
  // eslint-disable-next-line no-undef,ember/new-module-imports
  templateOnlyComponent = Ember._templateOnlyComponent;
  // eslint-disable-next-line no-empty
} catch {}
try {
  // eslint-disable-next-line no-undef
  templateOnlyComponent = require('ember').default._templateOnlyComponent;
  // eslint-disable-next-line no-empty
} catch {}

// TODO switch to an adapter architecture, similar to the acceptance tests
async function captureMessage(type, callback) {
  if (!EmberDebug.port) {
    throw new Error('Cannot call captureMessage without a port');
  }

  let send = EmberDebug.port.send;

  try {
    let captured;

    const receivedPromise = new Promise((resolve) => {
      setTimeout(resolve, 500);
      EmberDebug.port.send = (name, message) => {
        if (!captured && name === type) {
          resolve();
          captured = JSON.parse(JSON.stringify(message));
        } else {
          send.call(EmberDebug.port, name, message);
        }
      };
    });

    await callback();
    await receivedPromise;

    if (captured) {
      return captured;
    } else {
      throw new Error(`Did not send a message of type ${type}`);
    }
  } finally {
    EmberDebug.port.send = send;
  }
}

async function digDeeper(objectId, property) {
  return await captureMessage('objectInspector:updateObject', async () => {
    EmberDebug.port.trigger('objectInspector:digDeeper', {
      objectId,
      property,
    });
  });
}

async function inspectById(objectId) {
  return await captureMessage('objectInspector:updateObject', async () => {
    EmberDebug.port.trigger('objectInspector:inspectById', {
      objectId,
    });
  });
}

async function getRenderTree() {
  let message = await captureMessage('view:renderTree', async () => {
    EmberDebug.port.trigger('view:getTree', {});
  });

  if (message) {
    return message.tree;
  }
}

function isVisible(element) {
  let { width, height } = element.getBoundingClientRect();
  return width > 0 && height > 0;
}

function matchTree(tree, matchers, name) {
  QUnit.assert.strictEqual(
    tree.length,
    matchers.length,
    `${name} tree and matcher should have the same length`,
  );

  for (let i = 0; i < matchers.length; i++) {
    match(tree[i], matchers[i]);
  }
}

function match(actual, matcher, message) {
  if (typeof matcher === 'function') {
    matcher(actual);
  } else if (Array.isArray(matcher)) {
    QUnit.assert.ok(
      matcher.indexOf(actual) > -1,
      `${actual} should be one of ${matcher.join('/')}`,
    );
  } else if (matcher instanceof RegExp && actual !== null) {
    QUnit.assert.ok(actual.match(matcher), `${actual} should match ${matcher}`);
  } else if (matcher !== null && typeof matcher === 'object') {
    QUnit.assert.deepEqual(actual, matcher, message);
  } else {
    QUnit.assert.strictEqual(actual, matcher, message);
  }
}

function Any() {
  return () => {};
}

function Eq(item) {
  return (actual) => {
    QUnit.assert.strictEqual(actual, item);
  };
}

function Undefined() {
  return Eq(undefined);
}

function Serialized(id) {
  return (actual) => {
    QUnit.assert.ok(
      typeof actual === 'object' && actual !== null,
      'serialized object should be an object',
    );
    QUnit.assert.ok(
      typeof actual.id === 'string',
      'serialized object should have a string id',
    );

    if (id === undefined) {
      QUnit.assert.ok(
        actual.id.match(/^ember[0-9]+$/),
        'serialized object should have an ember guid',
      );
    } else {
      QUnit.assert.strictEqual(
        actual.id,
        id,
        'serialized object should have an ember guid',
      );
    }
  };
}

function RenderNodeID(id) {
  return (actual) => {
    QUnit.assert.ok(
      typeof actual === 'string',
      'render node id should be a string',
    );

    if (id === undefined) {
      QUnit.assert.ok(
        actual.match(/^.+render-node:.+$/),
        `render node id should have the right format, actual: ${actual}`,
      );
    } else {
      QUnit.assert.strictEqual(actual, id, 'render node id should match');
    }
  };
}

function Args({ names = [], positionals = 0 } = {}) {
  return (actual) => {
    QUnit.assert.ok(
      typeof actual === 'object' && actual !== null,
      'serialized args should be an object',
    );

    QUnit.assert.ok(
      actual !== null && !actual.named.__ARGS__,
      'serialized named args should not have __ARGS__',
    );

    QUnit.assert.ok(
      typeof actual.named === 'object' && actual !== null,
      'serialized named args should be an object',
    );
    QUnit.assert.deepEqual(
      Object.keys(actual.named),
      names,
      'serialized named args should have the right keys',
    );

    QUnit.assert.ok(
      Array.isArray(actual.positional),
      'serialized positional args should be an array',
    );
    QUnit.assert.strictEqual(
      actual.positional.length,
      positionals,
      'serialized positional args should have the right number of items',
    );
  };
}

function RenderNode(
  {
    id = RenderNodeID(),
    type,
    name,
    args = Args(),
    instance = Any(),
    template = /^.+\.hbs$/,
    bounds = ['single', 'range', null],
  },
  ...children
) {
  return (actual) => {
    match(actual.id, id);
    match(actual.type, type, `${name} should have correct type`);
    match(actual.name, name, `${name} should have correct name`);
    match(actual.args, args);
    match(
      actual.instance,
      instance,
      `${name} ${type} should have correct instance`,
    );
    match(
      actual.template,
      template,
      `${name} ${type} should have correct template`,
    );
    match(actual.bounds, bounds, `${name} ${type} should have correct bounds`);
    matchTree(actual.children, children, `${name} ${type}`);
  };
}

function Component(
  {
    name,
    instance = Serialized(),
    template = `my-app/components/${name}.hbs`,
    bounds = 'single',
    ...options
  },
  ...children
) {
  return RenderNode(
    { name, instance, template, bounds, ...options, type: 'component' },
    ...children,
  );
}

function Modifier(
  {
    name,
    instance = Serialized(),
    template = null,
    bounds = 'single',
    ...options
  },
  ...children
) {
  return RenderNode(
    { name, instance, template, bounds, ...options, type: 'modifier' },
    ...children,
  );
}

function HtmlElement(
  {
    name,
    instance = Serialized(),
    args = Args(),
    template = null,
    bounds = 'single',
    ...options
  },
  ...children
) {
  return RenderNode(
    {
      name,
      instance,
      args,
      template,
      bounds,
      ...options,
      type: 'html-element',
    },
    ...children,
  );
}

function RouteArgs() {
  if (hasEmberVersion(6, 4)) {
    // Related to routable components
    return Args({ names: ['controller', 'model'] });
  }
  if (hasEmberVersion(3, 14)) {
    return Args({ names: ['model'] });
  }
  return Args();
}

function Route(
  {
    name,
    args = RouteArgs(),
    instance = Serialized(),
    template = `my-app/templates/${name}.hbs`,
    ...options
  },
  ...children
) {
  return RenderNode(
    { type: 'outlet', name: 'main', instance: undefined, template: null },
    RenderNode(
      { name, args, instance, template, ...options, type: 'route-template' },
      ...children,
    ),
  );
}

function TopLevel(...children) {
  return Route(
    {
      name: '-top-level',
      args: Args(),
      instance: Undefined(),
      template: /^packages\/.+\/templates\/outlet\.hbs$/,
    },
    ...children,
  );
}

function findInspectorElement(kind) {
  for (let element of document.body.children) {
    if (element.id.startsWith(`ember-inspector-${kind}-`)) {
      return element;
    }
  }

  throw new Error(`Cannot find ${kind} inspector element`);
}

module('Ember Debug - View', function (hooks) {
  setupEmberDebugTest(hooks, {
    routes() {
      this.route('simple');
      this.route('test-in-element-in-component');
      this.route('test-component-in-in-element');
      this.route('wormhole');
      this.route('inputs');
      this.route('comments', { resetNamespace: true }, function () {});
      this.route('posts', { resetNamespace: true });
    },
  });

  hooks.beforeEach(async function () {
    EmberDebug.IGNORE_DEPRECATIONS = true;

    this.owner.register(
      'route:application',
      EmberRoute.extend({
        model() {
          return EmberObject.create({
            toString() {
              return 'Application model';
            },
          });
        },
      }),
    );

    this.owner.register(
      'route:simple',
      EmberRoute.extend({
        model() {
          return EmberObject.create({
            toString() {
              return 'Simple Model';
            },
          });
        },
      }),
    );

    this.owner.register(
      'route:test-in-element-in-component',
      EmberRoute.extend({
        model() {
          return EmberObject.create({
            toString() {
              return 'test-in-element-in-component Model';
            },
          });
        },
      }),
    );

    this.owner.register(
      'route:test-component-in-in-element',
      EmberRoute.extend({
        model() {
          return EmberObject.create({
            toString() {
              return 'Simple Model';
            },
          });
        },
      }),
    );

    this.owner.register(
      'route:wormhole',
      EmberRoute.extend({
        model() {
          return EmberObject.create({
            toString() {
              return 'Wormhole Model';
            },
          });
        },
      }),
    );

    this.owner.register(
      'route:inputs',
      EmberRoute.extend({
        model() {
          return EmberObject.create({
            toString() {
              return 'Simple Inputs';
            },
          });
        },
      }),
    );

    this.owner.register(
      'route:comments.index',
      EmberRoute.extend({
        model() {
          return A(['first comment', 'second comment', 'third comment']);
        },
      }),
    );

    this.owner.register(
      'route:posts',
      EmberRoute.extend({
        model() {
          return 'String as model';
        },
      }),
    );

    this.owner.register(
      'controller:application',
      Controller.extend({
        toString() {
          return 'App.ApplicationController';
        },
      }),
    );

    this.owner.register(
      'controller:simple',
      Controller.extend({
        foo() {},
        get elementTarget() {
          return document.querySelector('#target');
        },
        toString() {
          return 'App.SimpleController';
        },
      }),
    );

    this.owner.register(
      'component:test-foo',
      setComponentTemplate(
        hbs('test-foo', {
          moduleName: 'my-app/components/test-foo.hbs',
        }),
        EmberComponent.extend({
          classNames: ['simple-component'],
          toString() {
            return 'App.TestFooComponent';
          },
        }),
      ),
    );

    this.owner.register(
      'component:test-bar',
      setComponentTemplate(
        hbs(
          `<!-- before -->
          <div class="another-component">
          {{@value}}
            <span>test</span>
            <span class="bar-inner">bar</span>
          </div>
          <!-- after -->`,
          { moduleName: 'my-app/components/test-bar.hbs' },
        ),
        templateOnlyComponent?.() ||
          EmberComponent.extend({
            tagName: '',
            toString() {
              return 'App.TestBarComponent';
            },
          }),
      ),
    );

    this.owner.register(
      'component:test-in-element-in-component',
      setComponentTemplate(
        hbs(`
          {{#in-element this.elementTarget}}
            <p class='test-in-element-in-component'>
              App.TestInElementInComponent
            </p>
          {{/in-element}}
        `),
        EmberComponent.extend({
          init(...args) {
            this._super(...args);
            this.elementTarget = document.querySelector('#target');
          },
          toString() {
            return 'App.TestInElementInComponent';
          },
        }),
      ),
    );

    this.owner.register(
      'component:test-component-in-in-element',
      setComponentTemplate(
        hbs(`
          <p class='test-component-in-in-element'>
            App.TestComponentInElement
          </p>
        `),
        EmberComponent.extend({
          toString() {
            return 'App.TestComponentInElement';
          },
        }),
      ),
    );

    /*
    Setting line-height to normal because normalize.css sets the
    html line-height to 1.15. This seems to cause a measurement
    error with getBoundingClientRect
    */
    this.owner.register(
      'template:application',
      hbs(
        `<div class="application" style="line-height: normal;">
          <div id="target"></div>
          {{outlet}}
        </div>`,
        { moduleName: 'my-app/templates/application.hbs' },
      ),
    );

    this.owner.register(
      'template:simple',
      hbs(
        `
        <div {{did-insert this.foo}}>
          <div>
            Simple {{test-foo}} {{test-bar value=(hash x=123 [x.y]=456)}} {{#in-element this.elementTarget}}<TestComponentInInElement />{{/in-element}}
          </div>
        </div>
        `,
        {
          moduleName: 'my-app/templates/simple.hbs',
        },
      ),
    );

    this.owner.register(
      'template:test-in-element-in-component',
      hbs('<TestInElementInComponent />', {
        moduleName: 'my-app/templates/test-in-element-in-component.hbs',
      }),
    );

    this.owner.register(
      'template:test-component-in-in-element',
      hbs('<TestComponentInInElement />', {
        moduleName: 'my-app/templates/test-component-in-in-element.hbs',
      }),
    );

    this.owner.register(
      'template:wormhole',
      hbs(
        '<EmberWormhole @to="target"><div class="in-wormhole">Wormhole</div></EmberWormhole>',
        {
          moduleName: 'my-app/templates/wormhole.hbs',
        },
      ),
    );
    this.owner.register(
      'template:inputs',
      hbs('Simple <Input @value="987" />', {
        moduleName: 'my-app/templates/inputs.hbs',
      }),
    );

    this.owner.register(
      'template:comments/index',
      hbs('{{#each this.comments as |comment|}}{{comment}}{{/each}}', {
        moduleName: 'my-app/templates/comments/index.hbs',
      }),
    );
    this.owner.register(
      'template:posts',
      hbs('Posts', { moduleName: 'my-app/templates/posts.hbs' }),
    );

    this.owner.register('modifier:did-insert', didInsert);
  });

  test('Simple Inputs Tree', async function () {
    await visit('/inputs');

    let tree = await getRenderTree();

    const inputChildren = [];
    // https://github.com/emberjs/ember.js/commit/e6cf1766f8e02ddb24bf67833c148e7d7c93182f
    const modifiers = [
      Modifier({
        name: 'on',
        args: Args({ positionals: 2 }),
      }),
      Modifier({
        name: 'on',
        args: Args({ positionals: 2 }),
      }),
      Modifier({
        name: 'on',
        args: Args({ positionals: 2 }),
      }),
      Modifier({
        name: 'on',
        args: Args({ positionals: 2 }),
      }),
      Modifier({
        name: 'on',
        args: Args({ positionals: 2 }),
      }),
    ];
    if (hasEmberVersion(3, 28) && !hasEmberVersion(4, 0)) {
      modifiers.push(
        Modifier({
          name: 'deprecated-event-handlers',
          args: Args({ positionals: 1 }),
        }),
      );
    }
    const enableModifierSupport = isInVersionSpecifier('>3.28.0', VERSION);
    if (!enableModifierSupport) {
      modifiers.length = 0;
    }

    if (!hasEmberVersion(3, 26)) {
      inputChildren.push(
        Component({
          name: '-text-field',
          template: /.*/,
          args: Args({ names: ['target', 'value'], positionals: 0 }),
        }),
      );
    }

    if (enableModifierSupport) {
      const htmlElement = HtmlElement(
        {
          name: 'input',
          args: Args({ names: ['id', 'class', 'type'] }),
        },
        ...modifiers,
      );
      if (hasEmberVersion(3, 26)) {
        inputChildren.push(htmlElement);
      }
    }

    matchTree(tree, [
      TopLevel(
        Route(
          { name: 'application' },
          Route(
            { name: 'inputs' },
            Component(
              {
                name: 'input',
                bounds: 'single',
                args: Args({ names: ['value'], positionals: 0 }),
                template: /.*/,
              },
              ...inputChildren,
            ),
          ),
        ),
      ),
    ]);
  });

  test('Simple View Tree', async function () {
    await visit('/simple');

    let tree = await getRenderTree();

    let argsTestPromise;

    const enableModifierSupport = isInVersionSpecifier('>3.28.0', VERSION);

    const children = [
      Component({ name: 'test-foo', bounds: 'single' }),
      Component({
        name: 'test-bar',
        bounds: 'range',
        args: Args({ names: ['value'], positionals: 0 }),
        instance: (actual) => {
          async function testArgsValue() {
            const value = await digDeeper(actual.id, 'args');
            QUnit.assert.equal(
              value.details[0].properties[0].value.inspect,
              '{ x: 123, x.y: 456 }',
              'test-bar args value inspect should be correct',
            );
          }
          argsTestPromise = testArgsValue();
        },
      }),
      Component(
        {
          name: 'in-element',
          args: (actual) => {
            QUnit.assert.ok(actual.positional[0]);
            async function testArgsValue() {
              const value = await inspectById(actual.positional[0].id);
              QUnit.assert.equal(
                value.details[1].name,
                'HTMLDivElement',
                'in-element args value inspect should be correct',
              );
            }
            argsTestPromise = testArgsValue();
          },
          template: null,
        },
        Component({
          name: 'test-component-in-in-element',
          template: () => null,
        }),
      ),
    ];

    const root = [];

    if (enableModifierSupport) {
      root.push(
        ...[
          HtmlElement(
            {
              name: 'div',
            },
            Modifier({
              name: 'did-insert',
              args: Args({ positionals: 1 }),
            }),
            ...children,
          ),
        ],
      );
    } else {
      root.push(...children);
    }

    matchTree(tree, [
      TopLevel(
        Route({ name: 'application' }, Route({ name: 'simple' }, ...root)),
      ),
    ]);

    QUnit.assert.ok(
      argsTestPromise instanceof Promise,
      'args should be tested',
    );
    await argsTestPromise;
  });

  test("Supports applications that don't have the ember-application CSS class", async function (assert) {
    await visit('/simple');

    assert
      .dom(this.element)
      .hasClass(
        'ember-application',
        'The rootElement has the .ember-application CSS class',
      );

    this.element.classList.remove('ember-application');

    // Restart the inspector
    EmberDebug.start();

    await visit('/simple');

    assert
      .dom(this.element)
      .doesNotHaveClass(
        'ember-application',
        'The rootElement no longer has the .ember-application CSS class',
      );

    let tree = await getRenderTree();

    const root = [];

    const children = [
      Component({ name: 'test-foo', bounds: 'single' }),
      Component({
        name: 'test-bar',
        bounds: 'range',
        args: Args({ names: ['value'], positionals: 0 }),
      }),
      Component(
        {
          name: 'in-element',
          args: Args({ names: [], positionals: 1 }),
          template: null,
        },
        Component({
          name: 'test-component-in-in-element',
          template: () => null,
        }),
      ),
    ];

    const enableModifierSupport = isInVersionSpecifier('>3.28.0', VERSION);

    if (enableModifierSupport) {
      root.push(
        ...[
          HtmlElement(
            {
              name: 'div',
            },
            Modifier({
              name: 'did-insert',
              args: Args({ positionals: 1 }),
            }),
            ...children,
          ),
        ],
      );
    } else {
      root.push(...children);
    }

    matchTree(tree, [
      TopLevel(
        Route({ name: 'application' }, Route({ name: 'simple' }, ...root)),
      ),
    ]);
  });

  test('Does not list nested {{yield}} views', async function () {
    this.owner.register(
      'component:x-first',
      setComponentTemplate(
        hbs('{{#x-second}}{{yield}}{{/x-second}}', {
          moduleName: 'my-app/components/x-first.hbs',
        }),
        EmberComponent.extend(),
      ),
    );
    this.owner.register(
      'component:x-second',
      setComponentTemplate(
        hbs('{{yield}}', {
          moduleName: 'my-app/components/x-second.hbs',
        }),
        EmberComponent.extend(),
      ),
    );
    this.owner.register(
      'template:posts',
      hbs('{{#x-first}}Foo{{/x-first}}', {
        moduleName: 'my-app/templates/posts.hbs',
      }),
    );

    await visit('/posts');

    let tree = await getRenderTree();

    matchTree(tree, [
      TopLevel(
        Route(
          { name: 'application' },
          Route(
            { name: 'posts' },
            Component({ name: 'x-first' }, Component({ name: 'x-second' })),
          ),
        ),
      ),
    ]);
  });

  module('Highlighting Views on hover', function (hooks) {
    let foo;
    let bar;
    let inElement;
    let tooltip;
    let highlight;

    hooks.beforeEach(async function (assert) {
      await visit('/simple');
      await getRenderTree();

      foo = find('.simple-component');
      bar = find('.another-component');
      tooltip = findInspectorElement('tooltip');
      highlight = findInspectorElement('highlight');

      assert.ok(!isVisible(tooltip), 'tooltip is not visible');
      assert.ok(!isVisible(highlight), 'highlight is not visible');

      // eslint-disable-next-line ember/no-runloop
      run(() =>
        EmberDebug.port.trigger('view:inspectViews', { inspect: true }),
      );
    });

    hooks.afterEach(function () {
      foo = bar = inElement = tooltip = highlight = undefined;
    });

    test('Highlighting Views on hover', async function (assert) {
      await triggerEvent('.simple-component', 'mousemove');

      assert.ok(isVisible(tooltip), 'tooltip is visible');
      assert
        .dom('.ember-inspector-tooltip-header', tooltip)
        .hasText('<TestFoo>');
      assert
        .dom('.ember-inspector-tooltip-detail-template', tooltip)
        .hasText(
          'my-app/components/test-foo.hbs'.replace(/\//g, '\u200B/\u200B'),
        );
      assert
        .dom('.ember-inspector-tooltip-detail-instance', tooltip)
        .hasText('App.TestFooComponent');

      let actual = highlight.getBoundingClientRect();
      let expected = foo.getBoundingClientRect();

      assert.ok(isVisible(highlight), 'highlight is visible');
      assert.strictEqual(actual.x, expected.x, 'same x as component');
      assert.strictEqual(actual.y, expected.y, 'same y as component');
      assert.strictEqual(
        actual.width,
        expected.width,
        'same width as component',
      );
      assert.strictEqual(
        actual.height,
        expected.height,
        'same height as component',
      );

      await triggerEvent('.bar-inner', 'mousemove');

      assert.ok(isVisible(tooltip), 'tooltip is visible');
      assert
        .dom('.ember-inspector-tooltip-header', tooltip)
        .hasText('<TestBar>');
      assert
        .dom('.ember-inspector-tooltip-detail-template', tooltip)
        .hasText(
          'my-app/components/test-bar.hbs'.replace(/\//g, '\u200B/\u200B'),
        );
      assert
        .dom('.ember-inspector-tooltip-detail-instance', tooltip)
        .hasText(
          templateOnlyComponent
            ? 'TemplateOnlyComponent'
            : 'App.TestBarComponent',
        );

      actual = highlight.getBoundingClientRect();
      expected = bar.getBoundingClientRect();

      assert.ok(isVisible(highlight), 'highlight is visible');
      assert.strictEqual(actual.x, expected.x, 'same x as component');
      assert.strictEqual(actual.y, expected.y, 'same y as component');
      assert.strictEqual(
        actual.width,
        expected.width,
        'same width as component',
      );
      assert.strictEqual(
        actual.height,
        expected.height,
        'same height as component',
      );

      await triggerEvent(document.body, 'mousemove');

      assert.notOk(isVisible(tooltip), 'tooltip is not visible');
      assert.notOk(isVisible(highlight), 'highlight is not visible');

      // Pin tooltip and stop inspecting
      await click('.simple-component');
      await triggerEvent('.bar-inner', 'mousemove');

      assert.ok(isVisible(tooltip), 'tooltip is visible');
      assert
        .dom('.ember-inspector-tooltip-header', tooltip)
        .hasText('<TestFoo>');
      assert
        .dom('.ember-inspector-tooltip-detail-template', tooltip)
        .hasText(
          'my-app/components/test-foo.hbs'.replace(/\//g, '\u200B/\u200B'),
        );
      assert
        .dom('.ember-inspector-tooltip-detail-instance', tooltip)
        .hasText('App.TestFooComponent');

      actual = highlight.getBoundingClientRect();
      expected = foo.getBoundingClientRect();

      assert.ok(isVisible(highlight), 'highlight is visible');
      assert.deepEqual(actual.x, expected.x, 'same x as component');
      assert.deepEqual(actual.y, expected.y, 'same y as component');
      assert.deepEqual(actual.width, expected.width, 'same width as component');
      assert.deepEqual(
        actual.height,
        expected.height,
        'same height as component',
      );

      assert.ok(isVisible(tooltip), 'tooltip is visible');
      assert
        .dom('.ember-inspector-tooltip-header', tooltip)
        .hasText('<TestFoo>');
      assert
        .dom('.ember-inspector-tooltip-detail-template', tooltip)
        .hasText(
          'my-app/components/test-foo.hbs'.replace(/\//g, '\u200B/\u200B'),
        );
      assert
        .dom('.ember-inspector-tooltip-detail-instance', tooltip)
        .hasText('App.TestFooComponent');

      await triggerEvent(this.element, 'mousemove');

      assert.ok(isVisible(tooltip), 'tooltip is pinned');
      assert.ok(isVisible(highlight), 'highlight is pinned');

      // Dismiss tooltip
      await click(this.element);

      assert.notOk(isVisible(tooltip), 'tooltip is not visible');
      assert.notOk(isVisible(highlight), 'highlight is not visible');

      await triggerEvent('.bar-inner', 'mousemove');

      assert.notOk(isVisible(tooltip), 'tooltip is not visible');
      assert.notOk(isVisible(highlight), 'highlight is not visible');
    });

    test('in-element inside component', async function (assert) {
      await visit('test-in-element-in-component');
      await rerender();
      await getRenderTree();

      inElement = find('.test-in-element-in-component');

      await click('.test-in-element-in-component');

      assert
        .dom('.ember-inspector-tooltip-header', tooltip)
        .hasText('{{in-element}}');

      let actual = highlight.getBoundingClientRect();
      let expected = inElement.getBoundingClientRect();

      assert.ok(isVisible(tooltip), 'tooltip is visible');
      assert.ok(isVisible(highlight), 'highlight is visible');

      assert.deepEqual(actual.x, expected.x, 'same x as component');
      assert.deepEqual(actual.y, expected.y, 'same y as component');
      assert.deepEqual(actual.width, expected.width, 'same width as component');
      assert.deepEqual(
        actual.height,
        expected.height,
        'same height as component',
      );

      assert
        .dom('.ember-inspector-tooltip-detail-instance', tooltip)
        .hasText('InElement');
    });

    test('component inside in-element', async function (assert) {
      await visit('test-component-in-in-element');
      await rerender();
      await getRenderTree();

      inElement = find('.test-component-in-in-element');

      await click('.test-component-in-in-element');

      assert
        .dom('.ember-inspector-tooltip-header', tooltip)
        .hasText('<TestComponentInInElement>');

      let actual = highlight.getBoundingClientRect();
      let expected = inElement.getBoundingClientRect();

      assert.ok(isVisible(tooltip), 'tooltip is visible');
      assert.ok(isVisible(highlight), 'highlight is visible');

      assert.deepEqual(actual.x, expected.x, 'same x as component');
      assert.deepEqual(actual.y, expected.y, 'same y as component');
      assert.deepEqual(actual.width, expected.width, 'same width as component');
      assert.deepEqual(
        actual.height,
        expected.height,
        'same height as component',
      );

      assert
        .dom('.ember-inspector-tooltip-detail-instance', tooltip)
        .hasText('App.TestComponentInElement');
    });

    test('wormhole', async function (assert) {
      await visit('wormhole');
      await rerender();
      await getRenderTree();

      inElement = find('.in-wormhole');

      await click('.in-wormhole');

      assert
        .dom('.ember-inspector-tooltip-header', tooltip)
        .hasText('<EmberWormhole>');

      let actual = highlight.getBoundingClientRect();
      let expected = inElement.getBoundingClientRect();

      assert.ok(isVisible(tooltip), 'tooltip is visible');
      assert.ok(isVisible(highlight), 'highlight is visible');

      assert.deepEqual(actual.x, expected.x, 'same x as component');
      assert.deepEqual(actual.y, expected.y, 'same y as component');
      assert.deepEqual(actual.width, expected.width, 'same width as component');
      assert.deepEqual(
        actual.height,
        expected.height,
        'same height as component',
      );

      assert
        .dom('.ember-inspector-tooltip-detail-instance', tooltip)
        .hasText(/ember-wormhole/);
    });
  });
});
