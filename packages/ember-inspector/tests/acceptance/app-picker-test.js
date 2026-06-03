import { visit, findAll, fillIn } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupTestAdapter } from '../test-adapter';

import TestApplication from 'vite-test-app/app.js';

module('App Picker', function (hooks) {
  setupTestAdapter(hooks);
  setupApplicationTest(hooks);

  hooks.before(function () {
    const div = document.createElement('div');
    div.id = 'second-ember-app';

    this.secondApp = TestApplication.create({
      rootElement: "#second-ember-app",
      location: 'none',
    });
  });

  hooks.after(function () {
    this.secondApp.destroy();
  });

  test('Both apps show up in picker', async function (assert) {
    await visit('/component-tree');

    assert.dom('.app-picker').exists('App Picker is shown');

    const appIds = globalThis.emberInspectorApps.filter(({ app }) => app.modulePrefix !== 'ember-inspector').map(({ app }) => app.applicationId);

    console.log(appIds);

    let options = findAll('.app-picker option');

    assert.strictEqual(options.length, 2);
    assert.dom(options[0]).hasText('vite-test-app');
    assert.dom(options[0]).hasValue(appIds[0]);
    assert.dom(options[1]).hasText('vite-test-app');
    assert.dom(options[1]).hasValue(appIds[1]);

    assert.strictEqual(
      this.currentApplicationId,
      'app-one',
      'First App is selected',
    );
    assert.ok(options[0].selected, 'First App is selected');
    assert.notOk(options[1].selected, 'Second App is not selected');

    await fillIn('.app-picker select', 'app-two');
    await visit('/component-tree');

    assert.strictEqual(options.length, 2);
    assert.dom(options[0]).hasText('First App');
    assert.dom(options[1]).hasText('Second App');

    assert.strictEqual(
      this.currentApplicationId,
      'app-two',
      'Second App is selected',
    );
    assert.notOk(options[0].selected, 'First App is not selected');
    assert.ok(options[1].selected, 'Second App is selected');

    await fillIn('.app-picker select', 'app-one');
    await visit('/component-tree');

    assert.strictEqual(options.length, 2);
    assert.dom(options[0]).hasText('First App');
    assert.dom(options[1]).hasText('Second App');

    assert.strictEqual(
      this.currentApplicationId,
      'app-one',
      'First App is selected',
    );
    assert.ok(options[0].selected, 'First App is selected');
    assert.notOk(options[1].selected, 'Second App is not selected');
  });
});
