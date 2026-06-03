import { describe, expect, test } from 'vitest';
import { inspect } from './type-check.js';

describe('inspect', () => {
  test('An POJO with Symbols is correctly transformed into preview', () => {
    const symbol = Symbol('test');
    const symbolValue = Symbol('value');

    const inspected = {
      [symbol]: 'Symbol Value',
      symbolVal: symbolValue,
    };

    expect(inspect(inspected)).toBe('{ symbolVal: Symbol(value) }');
  });
});
