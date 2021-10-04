import ProfileManager from 'ember-debug/models/profile-manager';
import { find, visit, waitUntil, getSettledState } from '@ember/test-helpers';
import EmberComponent from '@ember/component';
import EmberRoute from '@ember/routing/route';
import EmberObject from '@ember/object';
import Controller from '@ember/controller';
import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import EmberDebug from 'ember-debug/main';
import setupEmberDebugTest from '../helpers/setup-ember-debug-test';
import { run } from '@ember/runloop';

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

module('Ember Debug - profile manager component highlight', function (hooks) {
  setupEmberDebugTest(hooks, {
    routes() {
      this.route('simple');
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
      })
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
      })
    );

    this.owner.register(
      'route:posts',
      EmberRoute.extend({
        model() {
          return 'String as model';
        },
      })
    );

    this.owner.register(
      'controller:application',
      Controller.extend({
        toString() {
          return 'App.ApplicationController';
        },
      })
    );

    this.owner.register(
      'controller:simple',
      Controller.extend({
        toString() {
          return 'App.SimpleController';
        },
      })
    );

    this.owner.register(
      'component:test-foo',
      EmberComponent.extend({
        classNames: ['simple-component'],
        toString() {
          return 'App.TestFooComponent';
        },
      })
    );

    this.owner.register(
      'component:test-bar',
      EmberComponent.extend({
        tagName: '',
        toString() {
          return 'App.TestBarComponent';
        },
      })
    );

    /*
    Setting line-height to normal because normalize.css sets the
    html line-height to 1.15. This seems to cause a measurement
    error with getBoundingClientRect
    */
    this.owner.register(
      'template:application',
      hbs(
        '<div class="application" style="line-height: normal;">{{outlet}}</div>',
        { moduleName: 'my-app/templates/application.hbs' }
      )
    );
    this.owner.register(
      'template:simple',
      hbs('Simple {{test-foo}} {{test-bar}}', {
        moduleName: 'my-app/templates/simple.hbs',
      })
    );
    this.owner.register(
      'template:posts',
      hbs('Posts', { moduleName: 'my-app/templates/posts.hbs' })
    );
    this.owner.register(
      'template:components/test-foo',
      hbs('test-foo', {
        moduleName: 'my-app/templates/components/test-foo.hbs',
      })
    );
    this.owner.register(
      'template:components/test-bar',
      hbs(
        '<!-- before --><div class="another-component"><span>test</span> <span class="bar-inner">bar</span></div><!-- after -->',
        { moduleName: 'my-app/templates/components/test-bar.hbs' }
      )
    );
  });

  test('ProfileManager can be created', function (assert) {
    const profileManager = new ProfileManager();

    assert.ok(!!profileManager, 'it was created');
    assert.equal(profileManager.profiles.length, 0, 'it has no profiles');
  });

  test('Highlights for render are shown as expected', async function (assert) {
    await visit('/posts');

    // enable highlight
    run(() =>
      EmberDebug.port.trigger('render:updateShouldHighlightRender', {
        shouldHighlightRender: true,
      })
    );

    const newHighlights = [];

    const observer = new MutationObserver(function (records) {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node.className === 'ember-inspector-render-highlight') {
            newHighlights.push(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true });

    await visit('/simple');

    await waitUntil(() => {
      // Check for the settled state minus hasPendingTimers
      let { hasRunLoop, hasPendingRequests, hasPendingWaiters } =
        getSettledState();
      if (hasRunLoop || hasPendingRequests || hasPendingWaiters) {
        return false;
      }
      return true;
    });

    const simpleComponent = find('.simple-component');
    const anotherComponent = find('.another-component');

    const [simpleHighlight, anotherHighlight] = newHighlights;

    const simpleStyle = simpleHighlight.style;
    const simpleExpected = simpleComponent.getBoundingClientRect();
    assert.ok(simpleHighlight, 'simpleHighlight is visible');
    assert.equal(
      getRounded(simpleStyle.left),
      getRounded(simpleExpected.x),
      'same x as component'
    );
    assert.equal(
      getRounded(simpleStyle.top),
      getRounded(simpleExpected.y),
      'same y as component'
    );
    assert.equal(
      getRounded(simpleStyle.width),
      getRounded(simpleExpected.width),
      'same width as component'
    );
    assert.equal(
      getRounded(simpleStyle.height),
      getRounded(simpleExpected.height),
      'same height as component'
    );

    const anotherStyle = anotherHighlight.style;

    const anotherExpected = anotherComponent.getBoundingClientRect();
    assert.ok(anotherHighlight, 'anotherHighlight is visible');
    assert.equal(
      getRounded(anotherStyle.left),
      getRounded(anotherExpected.x),
      'same x as component'
    );
    assert.equal(
      getRounded(anotherStyle.top),
      getRounded(anotherExpected.y),
      'same y as component'
    );
    assert.equal(
      getRounded(anotherStyle.width),
      getRounded(anotherExpected.width),
      'same width as component'
    );
    assert.equal(
      getRounded(anotherStyle.height),
      getRounded(anotherExpected.height),
      'same height as component'
    );

    const highlights = document.getElementsByClassName(
      'ember-inspector-render-highlight'
    );

    assert.notOk(
      highlights.length,
      'tooltip should be destroyed after execution'
    );
  });
});
