/**
 * If the value is already wrapped in quotes, remove them, then add them back
 * to avoid double quotes issues
 * @param value The string to remove and add quotes to
 */
export default function parseText(value: string): string {
  let parsedValue;
  try {
    parsedValue = JSON.parse(value);
  } catch (e) {
    // if surrounded by quotes, remove quotes
    const match = value.match(/^"(.*)"$/);
    if (match && match.length > 1) {
      parsedValue = match[1];
    } else {
      parsedValue = value;
    }
  }
  return parsedValue;
}
