import { buildStyle } from 'ember-inspector/helpers/build-style';
import { module, test } from 'qunit';

module('Unit | Helper | buildStyle', function () {
  test('it should convert options to a string', function (assert) {
    let options = { prop1: '1', prop2: '2' };
    let style = buildStyle(null, options);
    assert.strictEqual(style.toString(), 'prop1:1;prop2:2;');
  });
});
