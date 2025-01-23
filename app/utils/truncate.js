export default function truncate(str, limit = 20, rest = '…') {
  if (str.length <= limit) {
    return str;
  }

  if (rest.length >= limit) {
    throw new Error('rest cannot be longer than limit');
  }

  let parts = str.split(/(\s+|\b)/); // split by whitespace or word boundaries
  let selected = []; // the parts to keep
  let targetLength = limit - rest.length; // leave room for the "..."
  let currentLength = 0;

  while (true) {
    let candidate = parts.shift();

    if (currentLength + candidate.length <= targetLength) {
      selected.push(candidate);
      currentLength += candidate.length;
    } else {
      if (currentLength === 0) {
        // We have no choice but to break in the middle of a long word
        selected.push(candidate.slice(0, targetLength));
      }

      break;
    }
  }

  selected.push(rest);

  return selected.join('');
}
