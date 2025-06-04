/* eslint-disable ember/no-classic-classes */
import { find, visit, waitUntil, getSettledState } from '@ember/test-helpers';
// eslint-disable-next-line ember/no-classic-components
import EmberComponent from '@ember/component';
import GlimmerComponent from '@glimmer/component';
import EmberRoute from '@ember/routing/route';
import Controller from '@ember/controller';
import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import EmberDebug from 'ember-debug/main';
import setupEmberDebugTest from '../helpers/setup-ember-debug-test';
import { run } from '@ember/runloop';
import Ember from 'ember-debug/utils/ember';
import { compareVersion } from 'ember-debug/utils/version';
import { setComponentTemplate } from '@ember/component';

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

const mockedComponents = () => {
  class OneRootGlimmer extends GlimmerComponent {
    classNames = 'simple-component';
  }

  return {
    text: {
      component: EmberComponent.extend({
        tagName: '',
      }),
      template: hbs('text only', {
        moduleName: 'my-app/templates/components/text.hbs',
      }),
    },
    'text-glimmer': {
      component: class extends GlimmerComponent {},
      template: hbs('text only', {
        moduleName: 'my-app/templates/components/text-glimmer.hbs',
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
    'comment-glimmer': {
      component: class extends GlimmerComponent {},
      template: hbs('<!-- comment -->', {
        moduleName: 'my-app/templates/components/comment-glimmer.hbs',
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
        { moduleName: 'my-app/templates/components/two-root.hbs' },
      ),
    },
    'two-root-glimmer': {
      component: class extends GlimmerComponent {},
      template: hbs(
        '<div class="simple-component">one</div><div class="another-component">two</div>',
        { moduleName: 'my-app/templates/components/two-root-glimmer.hbs' },
      ),
    },
    'root-comment-root': {
      component: EmberComponent.extend({
        tagName: '',
      }),
      template: hbs(
        '<div class="simple-component">one</div><!-- comment --><div class="another-component">two</div>',
        { moduleName: 'my-app/templates/components/root-comment-root.hbs' },
      ),
    },
    'root-comment-root-glimmer': {
      component: class extends GlimmerComponent {},
      template: hbs(
        '<div class="simple-component">one</div><!-- comment --><div class="another-component">two</div>',
        {
          moduleName:
            'my-app/templates/components/root-comment-root-glimmer.hbs',
        },
      ),
    },
    'comment-root-comment': {
      component: EmberComponent.extend({
        tagName: '',
      }),
      template: hbs(
        '<!-- comment 1 --><div class="simple-component">one</div><!-- comment 2 -->',
        { moduleName: 'my-app/templates/components/comment-root-comment.hbs' },
      ),
    },
    'comment-root-comment-glimmer': {
      component: class extends GlimmerComponent {},
      template: hbs(
        '<!-- comment 1 --><div class="simple-component">one</div><!-- comment 2 -->',
        { moduleName: 'my-app/templates/components/comment-root-comment.hbs' },
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
};

const mockedRoutes = {
  'text-route': {
    template: hbs('<Text />', {
      moduleName: 'my-app/templates/text-route.hbs',
    }),
    expectedRender: [],
  },
  'text-glimmer-route': {
    template: hbs('<TextGlimmer />', {
      moduleName: 'my-app/templates/text-glimmer-route.hbs',
    }),
    expectedRender: [],
  },
  'comment-route': {
    template: hbs('<Comment />', {
      moduleName: 'my-app/templates/comment-route.hbs',
    }),
    expectedRender: [],
  },
  'comment-glimmer-route': {
    template: hbs('<CommentGlimmer />', {
      moduleName: 'my-app/templates/comment-glimmer-route.hbs',
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
  'two-root-glimmer-route': {
    template: hbs('<TwoRootGlimmer />', {
      moduleName: 'my-app/templates/two-root-glimmer-route.hbs',
    }),
    expectedRender: ['.simple-component', '.another-component'],
  },
  'root-comment-root-route': {
    template: hbs('<RootCommentRoot />', {
      moduleName: 'my-app/templates/root-comment-root-route.hbs',
    }),
    expectedRender: ['.simple-component', '.another-component'],
  },
  'root-comment-root-glimmer-route': {
    template: hbs('<RootCommentRootGlimmer />', {
      moduleName: 'my-app/templates/root-comment-root-glimmer-route.hbs',
    }),
    expectedRender: ['.simple-component', '.another-component'],
  },
  'comment-root-comment-route': {
    template: hbs('<CommentRootComment />', {
      moduleName: 'my-app/templates/comment-root-comment-route.hbs',
    }),
    expectedRender: ['.simple-component'],
  },
  'comment-root-comment-glimmer-route': {
    template: hbs('<CommentRootCommentGlimmer />', {
      moduleName: 'my-app/templates/comment-root-comment-glimmer-route.hbs',
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
      { moduleName: 'my-app/templates/application.hbs' },
    ),
  );

  owner.register('route:home', EmberRoute);

  owner.register(
    'template:home',
    hbs('Home', { moduleName: 'my-app/templates/home.hbs' }),
  );
};

const constructComponents = (owner, componentsMap) => {
  for (const componentKey in componentsMap) {
    if (componentsMap[componentKey].component) {
      owner.register(
        `component:${componentKey}`,
        componentsMap[componentKey].component,
      );
    }
    if (componentsMap[componentKey].template) {
      setComponentTemplate(
        componentsMap[componentKey].template,
        componentsMap[componentKey].component,
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
        mockedRoutes[routeKey].controller,
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
    assert.strictEqual(
      getRounded(style[styleKey]),
      getRounded(box[boxKey]),
      `same ${boxKey} as component`,
    );
  }
};

const matchHighlights = (
  assert,
  testedRoute,
  newHighlights,
  isGlimmerComponent,
) => {
  const renderedComponents = mockedRoutes[testedRoute].expectedRender.map(
    (selector) => {
      const component = find(selector);
      assert.ok(
        component,
        isComponentHighlightSupported
          ? 'expected component is rendered'
          : 'expected component is rendered but the component highlight is not supported',
      );
      return component;
    },
  );

  if (isComponentHighlightSupported && !isGlimmerComponent) {
    renderedComponents.forEach((renderedComponent, index) => {
      assertNodeSizes(assert, newHighlights[index], renderedComponent);
    });
  } else {
    assert.notOk(
      newHighlights.length,
      'Should not have any highlight if highlight is not supported',
    );
  }
};

const enableHighlight = () => {
  // eslint-disable-next-line ember/no-runloop
  run(() =>
    EmberDebug.port.trigger('render:updateShouldHighlightRender', {
      shouldHighlightRender: true,
    }),
  );
};

async function highlightsPromise(testedRoute, isGlimmerComponent) {
  await visit('/home');
  enableHighlight();
  // Glimmer component does support highlight. so there should not be any highlights
  const numberOfHighlights = isGlimmerComponent
    ? 0
    : mockedRoutes[testedRoute].expectedRender.length;
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
    constructComponents(this.owner, mockedComponents());
  });

  hooks.afterEach(function (assert) {
    const highlights = document.getElementsByClassName(
      'ember-inspector-render-highlight',
    );

    assert.notOk(
      highlights?.length,
      'highlights should be destroyed after execution',
    );
  });

  test('Should not show highlights for text component - Ember component', async function (assert) {
    const testedRoute = 'text-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute);

    assert.notOk(newHighlights.length, 'should not render highlight');
  });

  test('Should not show highlights for text component - Glimmer component', async function (assert) {
    const testedRoute = 'text-glimmer-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute, true);

    assert.notOk(newHighlights.length, 'should not render highlight');
  });

  test('Should not show highlights for comment component - Ember component', async function (assert) {
    const testedRoute = 'comment-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute);

    assert.notOk(newHighlights.length, 'should not render highlight');
  });

  test('Should not show highlights for comment component - Glimmer component', async function (assert) {
    const testedRoute = 'comment-glimmer-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute, true);

    assert.notOk(newHighlights.length, 'should not render highlight');
  });

  test('Should highlight one rootNode Ember component', async function (assert) {
    const testedRoute = 'one-root-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute);

    matchHighlights(assert, testedRoute, newHighlights);
  });

  test('Highlight is not supported, should not highlight one rootNode Glimmer component', async function (assert) {
    const testedRoute = 'one-root-glimmer-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute, true);

    matchHighlights(assert, testedRoute, newHighlights, true);
  });

  test('Should highlight two rootNode ([rootNode, rootNode] and no tagName) Ember component', async function (assert) {
    const testedRoute = 'two-root-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute);

    matchHighlights(assert, testedRoute, newHighlights);
  });

  test('Highlight is not supported, should not highlight two rootNode ([rootNode, rootNode] and no tagName) Glimmer component', async function (assert) {
    const testedRoute = 'two-root-glimmer-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute, true);

    matchHighlights(assert, testedRoute, newHighlights, true);
  });

  test('Should highlight two rootNode with one comment ([rootNode, commentNode, rootNode] and no tagName) Ember component', async function (assert) {
    const testedRoute = 'root-comment-root-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute);

    matchHighlights(assert, testedRoute, newHighlights);
  });

  test('Highlight is not supported, should not highlight two rootNode with one comment ([rootNode, commentNode, rootNode] and no tagName) Glimmer component', async function (assert) {
    const testedRoute = 'root-comment-root-glimmer-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute, true);

    matchHighlights(assert, testedRoute, newHighlights, true);
  });

  test('Should highlight one rootNode with two comment ([commentNode, rootNode, commentNode] and no tagName) Ember component', async function (assert) {
    const testedRoute = 'comment-root-comment-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute);

    matchHighlights(assert, testedRoute, newHighlights);
  });

  test('Highlight is not supported, should not highlight one rootNode with two comment ([commentNode, rootNode, commentNode] and no tagName) Glimmer component', async function (assert) {
    const testedRoute = 'comment-root-comment-glimmer-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute, true);

    matchHighlights(assert, testedRoute, newHighlights, true);
  });

  test('Should highlight tagName div Ember component', async function (assert) {
    const testedRoute = 'div-tag-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute);

    matchHighlights(assert, testedRoute, newHighlights);
  });

  test('Should highlight two rootNode ([rootNode, rootNode] and tagName div) Ember component', async function (assert) {
    const testedRoute = 'div-roots-route';
    constructRoutes(this.owner, [testedRoute]);

    const newHighlights = await highlightsPromise(testedRoute);

    matchHighlights(assert, testedRoute, newHighlights);
  });
});
