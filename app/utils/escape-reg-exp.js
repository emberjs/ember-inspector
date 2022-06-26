/* eslint no-useless-escape: 0 */
export default function (str) {
  if (typeof str === 'string') {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  }
}
