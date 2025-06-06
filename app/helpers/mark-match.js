import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';
import searchMatch from 'ember-inspector/utils/search-match';

function replaceRange(s, start, end, substitute) {
  return s.substring(0, start) + substitute + s.substring(end);
}
/**
 *
 * @param str {string}
 * @param regex {RegExp}
 * @return {SafeString}
 */
export function markMatch([str, regex]) {
  if (!regex) {
    return str;
  }
  const match = searchMatch(str, regex);
  if (!match) {
    return str;
  }
  const matchedText = str.slice(match.index, match.index + match[0].length);
  str = replaceRange(
    str,
    match.index,
    match.index + match[0].length,
    `<mark>${matchedText}</mark>`,
  );
  return htmlSafe(str);
}

export default helper(markMatch);
