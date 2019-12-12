import {
  visit,
  findAll,
  fillIn
} from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { registerResponderFor } from '../test-adapter';

module('App Picker', function(hooks) {
  hooks.beforeEach(function() {
    this.currentApplicationId = null;

    registerResponderFor('check-version', () => false);

    registerResponderFor('general:applicationBooted', {
      type: 'general:applicationBooted',
      applicationId: 'app-one',
      applicationName: 'First App',
      booted: true
    });

    registerResponderFor('app-picker-loaded', {
      type: 'apps-loaded',
      apps: [{
        applicationId: 'app-one',
        applicationName: 'First App'
      }, {
        applicationId: 'app-two',
        applicationName: 'Second App'
      }]
    });

    registerResponderFor('app-selected', ({ applicationId }) => {
      this.currentApplicationId = applicationId;
      return false;
    }, { count: 3 });

    registerResponderFor('deprecation:getCount', ({ applicationId, applicationName }) => ({
      type: 'deprecation:count',
      applicationId,
      applicationName,
      count: 0
    }));

    registerResponderFor('view:getTree', ({ applicationId, applicationName }) => ({
      type: 'view:renderTree',
      applicationId,
      applicationName,
      tree: []
    }), { count: 3 });
  });

  setupApplicationTest(hooks);

  test('Both apps show up in picker', async function(assert) {
    await visit('/component-tree');

    assert.dom('.app-picker').exists('App Picker is shown');

    let options = findAll('.app-picker option');

    assert.equal(options.length, 2);
    assert.dom(options[0]).hasText('First App');
    assert.dom(options[1]).hasText('Second App');

    assert.equal(this.currentApplicationId, 'app-one', 'First App is selected');
    assert.ok(options[0].selected, 'First App is selected');
    assert.ok(!options[1].selected, 'Second App is not selected');

    await fillIn('.app-picker select', 'app-two');

    assert.equal(options.length, 2);
    assert.dom(options[0]).hasText('First App');
    assert.dom(options[1]).hasText('Second App');

    assert.equal(this.currentApplicationId, 'app-two', 'Second App is selected');
    assert.ok(!options[0].selected, 'First App is not selected');
    assert.ok(options[1].selected, 'Second App is selected');

    await fillIn('.app-picker select', 'app-one');

    assert.equal(options.length, 2);
    assert.dom(options[0]).hasText('First App');
    assert.dom(options[1]).hasText('Second App');

    assert.equal(this.currentApplicationId, 'app-one', 'First App is selected');
    assert.ok(options[0].selected, 'First App is selected');
    assert.ok(!options[1].selected, 'Second App is not selected');
  });
});
