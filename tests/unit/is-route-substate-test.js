import { module, test } from 'qunit';
import isRouteSubstate from 'ember-inspector/utils/is-route-substate';

module('Unit | Lib | isRouteSubstate', function () {
  test('it should only find loading and error substates', function (assert) {
    assert.equal(isRouteSubstate('testing.loading'), true);
    assert.equal(isRouteSubstate('testing_loading'), true);
    assert.equal(isRouteSubstate('testing.error'), true);
    assert.equal(isRouteSubstate('testing_error'), true);
    assert.equal(isRouteSubstate('loading.testing'), false);
    assert.equal(isRouteSubstate('error_testing'), false);
    assert.equal(isRouteSubstate('testingloading'), false);
    assert.equal(isRouteSubstate('testingerror'), false);
  });
});
