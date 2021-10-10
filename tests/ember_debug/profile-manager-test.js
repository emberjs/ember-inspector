import { find, visit, waitUntil, getSettledState } from '@ember/test-helpers';
import EmberComponent from '@ember/component';
import GlimmerComponent from '@glimmer/component';
import EmberRoute from '@ember/routing/route';
import Controller from '@ember/controller';
import { module, test, skip } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import EmberDebug from 'ember-debug/main';
import setupEmberDebugTest from '../helpers/setup-ember-debug-test';
import { run } from '@ember/runloop';
import Ember from 'ember-debug/utils/ember';
import { compareVersion } from 'ember-debug/utils/version';

const { VERSION } = Ember;

const isComponentHighlightSupported = compareVersion(VERSION, '3.20.0') !== -1;

const getRounded = (value) => {
  let data = value;
  if (typeof data === 'string') {
    // remove unit px
    if (data.indexOf('px') !== -1) {
      data.replace('px', '');
    }
    data = parseFloat(data);
  }
  return Math.floor(data);
};
class OneRootGlimmer extends GlimmerComponent {
  classNames = 'simple-component';
}

const mockedComponents = {
  text: {
    component: EmberComponent.extend({
      tagName: '',
    }),
    template: hbs('text only', {
      moduleName: 'my-app/templates/components/test.hbs',
    }),
  },
  comment: {
    component: EmberComponent.extend({
      tagName: '',
    }),
    template: hbs('<!-- comment -->', {
      moduleName: 'my-app/templates/components/comment.hbs',
    }),
  },
  'one-root': {
    component: EmberComponent.extend({
      tagName: '',
    }),
    template: hbs('<div class="simple-component">one root</div>', {
      moduleName: 'my-app/templates/components/one-root.hbs',
    }),
  },
  'one-root-glimmer': {
    component: OneRootGlimmer,
    template: hbs('<div class={{this.classNames}}>one root</div>', {
      moduleName: 'my-app/templates/components/one-root-glimmer.hbs',
    }),
  },
  'two-root': {
    component: EmberComponent.extend({
      tagName: '',
    }),
    template: hbs(
      '<div class="simple-component">one</div><div class="another-component">two</div>',
      { moduleName: 'my-app/templates/components/two-root.hbs' }
    ),
  },
  'root-comment-root': {
    component: EmberComponent.extend({
      tagName: '',
    }),
    template: hbs(
      '<div class="simple-component">one</div><!-- comment --><div class="another-component">two</div>',
      { moduleName: 'my-app/templates/components/root-comment-root.hbs' }
    ),
  },
  'comment-root-comment': {
    component: EmberComponent.extend({
      tagName: '',
    }),
    template: hbs(
      '<!-- comment 1 --><div class="simple-component">one</div><!-- comment 2 -->',
      { moduleName: 'my-app/templates/components/comment-root-comment.hbs' }
    ),
  },
  'div-tag': {
    component: EmberComponent.extend({
      classNames: ['simple-component'],
    }),
    template: hbs('text in div', {
      moduleName: 'my-app/templates/components/div-tag.hbs',
    }),
  },
  'div-roots': {
    component: EmberComponent.extend({
      classNames: ['simple-component'],
    }),
    template: hbs('<div>one</div><div>two</div>', {
      moduleName: 'my-app/templates/components/div-roots.hbs',
    }),
  },
};

const mockedRoutes = {
  'text-route': {
    template: hbs('<Text />', {
      moduleName: 'my-app/templates/text-route.hbs',
    }),
    expectedRender: [],
  },
  'comment-route': {
    template: hbs('<Comment />', {
      moduleName: 'my-app/templates/comment-route.hbs',
    }),
    expectedRender: [],
  },
  'one-root-route': {
    template: hbs('<OneRoot />', {
      moduleName: 'my-app/templates/one-root-route.hbs',
    }),
    expectedRender: ['.simple-component'],
  },
  'one-root-glimmer-route': {
    template: hbs('<OneRootGlimmer />', {
      moduleName: 'my-app/templates/one-root-glimmer-route.hbs',
    }),
    expectedRender: ['.simple-component'],
  },
  'two-root-route': {
    template: hbs('<TwoRoot />', {
      moduleName: 'my-app/templates/two-root-route.hbs',
    }),
    expectedRender: ['.simple-component', '.another-component'],
  },
  'root-comment-root-route': {
    template: hbs('<RootCommentRoot />', {
      moduleName: 'my-app/templates/root-comment-root-route.hbs',
    }),
    expectedRender: ['.simple-component', '.another-component'],
  },
  'comment-root-comment-route': {
    template: hbs('<CommentRootComment />', {
      moduleName: 'my-app/templates/comment-root-comment-route.hbs',
    }),
    expectedRender: ['.simple-component'],
  },
  'div-tag-route': {
    template: hbs('<DivTag />', {
      moduleName: 'my-app/templates/div-tag-route.hbs',
    }),
    expectedRender: ['.simple-component'],
  },
  'div-roots-route': {
    template: hbs('<DivRoots />', {
      moduleName: 'my-app/templates/div-roots-route.hbs',
    }),
    expectedRender: ['.simple-component'],
  },
};

const constructBase = (owner) => {
  owner.register('route:application', EmberRoute);

  owner.register('controller:application', Controller);

  owner.register(
    'template:application',
    hbs(
      '<div class="application" style="line-height: normal;">{{outlet}}</div>',
      { moduleName: 'my-app/templates/application.hbs' }
    )
  );

  owner.register('route:home', EmberRoute);

  owner.register(
    'template:home',
    hbs('Home', { moduleName: 'my-app/templates/home.hbs' })
  );
};

const constructComponents = (owner, componentsMap) => {
  for (const componentKey in componentsMap) {
    if (componentsMap[componentKey].component) {
      owner.register(
        `component:${componentKey}`,
        componentsMap[componentKey].component
      );
    }
    if (componentsMap[componentKey].template) {
      owner.register(
        `template:components/${componentKey}`,
        componentsMap[componentKey].template
      );
    }
  }
};

const constructRoutes = (owner, routes) => {
  routes.forEach((routeKey) => {
    if (mockedRoutes[routeKey].route) {
      owner.register(`route:${routeKey}`, mockedRoutes[routeKey].route);
    }
    if (mockedRoutes[routeKey].controller) {
      owner.register(
        `controller:${routeKey}`,
        mockedRoutes[routeKey].controller
      );
    }
    if (mockedRoutes[routeKey].template) {
      owner.register(`template:${routeKey}`, mockedRoutes[routeKey].template);
    }
  });
};

const assertNodeSizes = (assert, synthetic, real) => {
  const style = synthetic.style;
  const box = real.getBoundingClientRect();
  const dimensions = [
    ['left', 'x'],
    ['top', 'y'],
    ['width', 'width'],
    ['height', 'height'],
  ];
  for (const [styleKey, boxKey] of dimensions) {
    assert.equal(
      getRounded(style[styleKey]),
      getRounded(box[boxKey]),
      `same ${boxKey} as component`
    );
  }
};

const matchHighlights = (assert, testedRoute, newHighlights) => {
  const renderedComponents = mockedRoutes[testedRoute].expectedRender.map(
    (selector) => {
      const component = find(selector);
      assert.ok(
        component,
        isComponentHighlightSupported
          ? 'expected component is rendered'
          : 'expected component is rendered but the component highlight is not supported'
      );
      return component;
    }
  );

  if (isComponentHighlightSupported) {
    renderedComponents.forEach((renderedComponent, index) => {
      assertNodeSizes(assert, newHighlights[index], renderedComponent);
    });
  }
};

const enableHighlight = () => {
  run(() =>
    EmberDebug.port.trigger('render:updateShouldHighlightRender', {
      shouldHighlightRender: true,
    })
  );
};

async function highlightsPromise(testedRoute) {
  await visit('/home');
  enableHighlight();
  const numberOfHighlights = mockedRoutes[testedRoute].expectedRender.length;
  const observedHighlights = [];
  if (!isComponentHighlightSupported) {
    await visit('/' + testedRoute);
    return observedHighlights;
  }
  const observer = new MutationObserver(function (records) {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (node.className === 'ember-inspector-render-highlight') {
          observedHighlights.push(node);
        }
      });
    });
  });
  observer.observe(document.body, { childList: true });
  await visit('/' + testedRoute);
  if (numberOfHighlights > 0) {
    await waitUntil(() => observedHighlights.length === numberOfHighlights, {
      timeout: 2000,
    });
  } else {
    await waitUntil(() => {
      // Check for the settled state minus hasPendingTimers
      let { hasRunLoop, hasPendingRequests, hasPendingWaiters } =
        getSettledState();
      if (hasRunLoop || hasPendingRequests || hasPendingWaiters) {
        return false;
      }
      return true;
    });
  }
  observer.disconnect();
  return observedHighlights;
}

module('Ember Debug - profile manager component highlight', function (hooks) {
  setupEmberDebugTest(hooks, {
    routes() {
      this.route('home');
      Object.keys(mockedRoutes).forEach((route) => {
        this.route(route);
      });
    },
  });

  hooks.beforeEach(async function () {
    EmberDebug.IGNORE_DEPRECATIONS = true;
    constructBase(this.owner);
    constructComponents(this.owner, mockedComponents);
  });

  hooks.afterEach(function (assert) {
    const highlights = document.getElementsByClassName(
      'ember-inspector-render-highlight'
    );

    assert.notOk(
      highlights?.length,
      'highlights should be destroyed after execution'
    );
  });

  test('Should not show highlights for text component - Ember component', async function (assert) {
    assert.expect(2);

    const testedRoute = 'text-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute);

    assert.notOk(newHighlights.length, 'should not render highlight');
  });

  test('Should not show highlights for comment component - Ember component', async function (assert) {
    assert.expect(2);

    const testedRoute = 'comment-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute);

    assert.notOk(newHighlights.length, 'should not render highlight');
  });

  test('Should highlight one rootNode Ember component', async function (assert) {
    assert.expect(isComponentHighlightSupported ? 6 : 2);

    const testedRoute = 'one-root-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute);

    matchHighlights(assert, testedRoute, newHighlights);
  });

  skip('Should highlight one rootNode Glimmer component', async function (assert) {
    assert.expect(isComponentHighlightSupported ? 6 : 2);

    const testedRoute = 'one-root-glimmer-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute);

    matchHighlights(assert, testedRoute, newHighlights);
  });

  test('Should highlight two rootNode ([rootNode, rootNode] and no tagName) Ember component', async function (assert) {
    assert.expect(isComponentHighlightSupported ? 11 : 3);

    const testedRoute = 'two-root-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute);

    matchHighlights(assert, testedRoute, newHighlights);
  });

  test('Should highlight two rootNode with one comment ([rootNode, commentNode, rootNode] and no tagName) Ember component', async function (assert) {
    assert.expect(isComponentHighlightSupported ? 11 : 3);

    const testedRoute = 'root-comment-root-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute);

    matchHighlights(assert, testedRoute, newHighlights);
  });

  test('Should highlight one rootNode with two comment ([commentNode, rootNode, commentNode] and no tagName) Ember component', async function (assert) {
    assert.expect(isComponentHighlightSupported ? 6 : 2);

    const testedRoute = 'comment-root-comment-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute);

    matchHighlights(assert, testedRoute, newHighlights);
  });

  test('Should highlight tagName div Ember component', async function (assert) {
    assert.expect(isComponentHighlightSupported ? 6 : 2);

    const testedRoute = 'div-tag-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute);

    matchHighlights(assert, testedRoute, newHighlights);
  });

  test('Should highlight two rootNode ([rootNode, rootNode] and tagName div) Ember component', async function (assert) {
    assert.expect(isComponentHighlightSupported ? 6 : 2);

    const testedRoute = 'div-roots-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute);

    matchHighlights(assert, testedRoute, newHighlights);
  });
});
