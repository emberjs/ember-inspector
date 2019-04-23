/**
 * If the value is already wrapped in quotes, remove them, then add them back
 * to avoid double quotes issues
 * @param {string} value The string to remove and add quotes to
 * @return {string}
 * @private
 */
export default function parseText(value) {
  let parsedValue;
  try {
    parsedValue = JSON.parse(value);
  } catch (e) {
    // if surrounded by quotes, remove quotes
    let match = value.match(/^"(.*)"$/);
    if (match && match.length > 1) {
      parsedValue = match[1];
    } else {
      parsedValue = value;
    }
  }
  return parsedValue;
}
