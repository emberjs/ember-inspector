import { click, find, rerender, visit } from '@ember/test-helpers';
import EmberRoute from '@ember/routing/route';
import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import setupEmberDebugTest from '../helpers/setup-ember-debug-test';

import EmberDebugImport from 'ember-debug/main';

let EmberDebug;

async function getRenderTree() {
  let send = EmberDebug.port.send;

  try {
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
      EmberDebug.port.send = (name, message) => {
        if (name === 'view:renderTree') {
          resolve();
        } else {
          send.call(EmberDebug.port, name, message);
        }
      };
      EmberDebug.port.trigger('view:getTree', {});
    });
  } finally {
    EmberDebug.port.send = send;
  }
}

function isVisible(element) {
  let { width, height } = element.getBoundingClientRect();
  return width > 0 && height > 0;
}

function findInspectorElement(kind) {
  for (let element of document.body.children) {
    if (element.id.startsWith(`ember-inspector-${kind}-`)) {
      return element;
    }
  }

  throw new Error(`Cannot find ${kind} inspector element`);
}

module('Ember Debug - Wormhole', function (hooks) {
  hooks.before(async function () {
    EmberDebug = (await EmberDebugImport).default();
  });

  setupEmberDebugTest(hooks, {
    routes() {
      this.route('wormhole');
    },
  });

  hooks.beforeEach(function () {
    EmberDebug.IGNORE_DEPRECATIONS = true;

    this.owner.register(
      'route:wormhole',
      class extends EmberRoute {
        model() {
          return EmberObject.create({
            toString() {
              return 'Wormhole Model';
            },
          });
        }
      },
    );

    /*
    Setting line-height to normal avoids a measurement
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
      'template:wormhole',
      hbs(
        '<EmberWormhole @to="target"><div class="in-wormhole">Wormhole</div></EmberWormhole>',
        { moduleName: 'my-app/templates/wormhole.hbs' },
      ),
    );
  });

  test('highlights a component inside a wormhole', async function (assert) {
    await visit('/wormhole');
    await rerender();
    await getRenderTree();

    let tooltip = findInspectorElement('tooltip');
    let highlight = findInspectorElement('highlight');

    assert.notOk(isVisible(tooltip), 'tooltip is not visible');
    assert.notOk(isVisible(highlight), 'highlight is not visible');

    // eslint-disable-next-line ember/no-runloop
    run(() => EmberDebug.port.trigger('view:inspectViews', { inspect: true }));

    let inElement = find('.in-wormhole');

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
