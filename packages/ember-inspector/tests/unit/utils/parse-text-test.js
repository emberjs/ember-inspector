import parseText from 'ember-inspector/utils/parse-text';
import { module, test } from 'qunit';

module('Unit | Utility | parseText', function () {
  // Replace this with your real tests.
  test('parseText returns the correct output', function (assert) {
    assert.strictEqual(
      parseText('foo'),
      'foo',
      'does not add quotes for string',
    );
    assert.strictEqual(
      parseText('"foo"'),
      'foo',
      'removes quotes when simple string is already wrapped in quotes',
    );
    assert.strictEqual(parseText('1'), 1);
    assert.strictEqual(
      parseText('"{"name":"teddy"}"'),
      '{"name":"teddy"}',
      'removes quotes around JSON strings',
    );
  });
});
