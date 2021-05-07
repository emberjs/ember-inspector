import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | app-config', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:app-config');
    assert.ok(route);
  });
});
