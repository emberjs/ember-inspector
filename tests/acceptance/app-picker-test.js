import {
  visit,
  findAll,
  fillIn,
} from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

let port;

module('App Picker', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    port = this.owner.lookup('port:main');
    port.reopen({
      detectedApplications: ['app-one', 'app-two'],
      applicationId: 'app-one'
    });
  });

  test("Both apps show up in picker", async function(assert) {
    await visit('/component-tree');

    assert.dom('.app-picker').exists('App Picker is shown');
    assert.dom(findAll('.app-picker option')[0]).hasText('app-one');
    assert.dom(findAll('.app-picker option')[1]).hasText('app-two');
  });

  test("Clicking each app in the picker switches between them", async function(assert) {
    await visit('/component-tree');

    await fillIn('.app-picker select', 'app-two');
    assert.equal(port.get('applicationId'), 'app-two');

    await fillIn('.app-picker select', 'app-one');
    assert.equal(port.get('applicationId'), 'app-one');
  });
});
