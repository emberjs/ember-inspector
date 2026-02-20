import { inspect } from 'ember-debug/type-check';
import { module, test } from 'qunit';

module('Unit | Utility | type-check', function () {
  test('inspect | An POJO with Symbols is correctly transformed into preview', async function (assert) {
    let symbol = Symbol('test');
    let symbolValue = Symbol('value');

    let inspected = {
      [symbol]: 'Symbol Value',
      symbolVal: symbolValue,
    };

    let obj = inspect(inspected);

    assert.deepEqual(
      obj,
      '{ symbolVal: Symbol(value) }',
      'object is in expected shape',
    );
  });
});
