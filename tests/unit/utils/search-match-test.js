import searchMatch from 'ember-inspector/utils/search-match';
import { module, test } from 'qunit';

module('Unit | Utility | searchMatch', function () {
  test('searchMatch returns the correct results', function (assert) {
    assert.ok(
      searchMatch('something-component-test', 'something'),
      'simple search with dash in text',
    );

    assert.ok(
      searchMatch('something-component-test', 'something-comp'),
      'content with dash; query with dash',
    );

    assert.ok(
      searchMatch('something-component-test', 'somethingcomp'),
      'content with dash; query without dash',
    );

    assert.ok(
      searchMatch('Something-component-test', 'somethingComp'),
      'content with dash and capital; query with capital and without dash',
    );

    assert.notOk(
      searchMatch('Something-component-test', 'xxx'),
      'match not found',
    );
  });
});
