import { module, test } from 'qunit';
let inspect;

module('Unit | Utility | type-check', function (hooks) {
  /**
   * ember-debug finds Ember through the app that the test helper boots,
   * so it must load after the app.
   */
  hooks.before(async function () {
    ({ inspect } = await import('ember-debug/type-check'));
  });

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
