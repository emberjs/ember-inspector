import { module, test } from 'qunit';
import { compareVersion, isVersionInRange } from 'ember-debug/version';

module('Unit | Utility | version', function () {
  test('compareVersion ignores pre-release suffixes', function (assert) {
    assert.strictEqual(compareVersion('3.16.0', '3.16.0'), 0);
    assert.strictEqual(compareVersion('3.15.9', '3.16.0'), -1);
    assert.strictEqual(compareVersion('4.0.0', '3.16.0'), 1);
    assert.strictEqual(compareVersion('7.5.0-alpha.2', '7.5.0'), 0);
  });

  test('isVersionInRange includes the lower bound and excludes the upper bound', function (assert) {
    assert.true(isVersionInRange('3.16.0', ['3.16.0', '']));
    assert.true(isVersionInRange('7.5.0-alpha.2', ['3.16.0', '']));
    assert.false(isVersionInRange('3.15.0', ['3.16.0', '']));
    assert.true(isVersionInRange('3.4.0', ['3.4.0', '3.16.0']));
    assert.false(isVersionInRange('3.16.0', ['3.4.0', '3.16.0']));
  });
});
