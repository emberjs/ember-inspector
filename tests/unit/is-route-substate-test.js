import { module, test } from 'qunit';
import isRouteSubstate from 'ember-inspector/utils/is-route-substate';

module('Unit | Lib | isRouteSubstate', function () {
  test('it should only find loading and error substates', function (assert) {
    assert.true(isRouteSubstate('testing.loading'));
    assert.true(isRouteSubstate('testing_loading'));
    assert.true(isRouteSubstate('testing.error'));
    assert.true(isRouteSubstate('testing_error'));
    assert.false(isRouteSubstate('loading.testing'));
    assert.false(isRouteSubstate('error_testing'));
    assert.false(isRouteSubstate('testingloading'));
    assert.false(isRouteSubstate('testingerror'));
  });
});
