/* eslint-disable no-useless-escape */
export default function (str?: string) {
  if (typeof str === 'string') {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  }

  return undefined;
}
