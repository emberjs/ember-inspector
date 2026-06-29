/**
 * Helper to build a style from its options. Also returns
 * a `SafeString` which avoids the style warning. Make sure
 * you don't pass user input to this helper.
 *
 * @method buildStyle
 * @param {Array} _ not used
 * @param {Object} options The options that become styles
 * @return {String} The style sting.
 */
import { helper } from '@ember/component/helper';

import { htmlSafe } from '@ember/template';
const { keys } = Object;

function sanitizeStyleValue(value) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }
  const str = String(value);
  // Block dangerous CSS patterns that could lead to XSS
  if (/[<>{]|javascript:|expression\(|@import/i.test(str)) {
    return '';
  }
  return str;
}

export function buildStyle(_, options) {
  return htmlSafe(
    keys(options).reduce((style, key) => {
      const value = sanitizeStyleValue(options[key]);
      return value ? `${style}${key}:${value};` : style;
    }, ''),
  );
}

export default helper(buildStyle);
