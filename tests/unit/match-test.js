import { match } from 'ember-inspector/helpers/match';
import { module, test } from 'qunit';

module('Unit | Helper | match', function () {
  test('it should find a match', function (assert) {
    assert.equal(match(['thing.string', 'thing']), true);
  });

  test('it should not find a match', function (assert) {
    assert.equal(match(['thing.string', 'test']), false);
  });
});
