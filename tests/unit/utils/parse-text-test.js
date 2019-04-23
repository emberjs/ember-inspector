import parseText from 'ember-inspector/utils/parse-text';
import { module, test } from 'qunit';

module('Unit | Utility | parseText', function() {

  // Replace this with your real tests.
  test('parseText returns the correct output', function(assert) {
    assert.equal(parseText('foo'), 'foo', 'does not add quotes for string');
    assert.equal(parseText('"foo"'), 'foo', 'removes quotes when simple string is already wrapped in quotes');
    assert.equal(parseText('1'), '1');
    assert.equal(parseText('"{"name":"teddy"}"'), '{"name":"teddy"}', 'removes quotes around JSON strings');
  });
});
