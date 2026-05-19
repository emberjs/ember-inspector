import { match } from 'ember-inspector/helpers/match';
import { module, test } from 'qunit';

module('Unit | Helper | match', function () {
  test('it should find a match', function (assert) {
    assert.true(match(['thing.string', 'thing']));
  });

  test('it should not find a match', function (assert) {
    assert.false(match(['thing.string', 'test']));
  });
});
