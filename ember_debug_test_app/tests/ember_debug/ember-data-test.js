import { module, test } from 'qunit';
import EmberDebug from 'ember-debug/main';
import { setupApplicationTest } from 'ember-qunit';
import EmberObject from '@ember/object';

class Adapter extends EmberObject {
  watchModelTypes() {}
}

module('Ember Debug - Data', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('data-adapter:main', Adapter);
    EmberDebug.isTesting = true;
    EmberDebug.owner = this.owner;
    EmberDebug.start();
  });

  hooks.after(() => {
    EmberDebug.destroyContainer();
    EmberDebug.clear();
  });

  test('data adapter sends models, even if there are none or no respone from ember data', function (assert) {
    let called = false;
    EmberDebug.dataDebug.modelTypesAdded = () => {
      called = true;
    };
    EmberDebug.dataDebug.messages.getModelTypes.bind(EmberDebug.dataDebug)();
    assert.true(called);
  });
});
