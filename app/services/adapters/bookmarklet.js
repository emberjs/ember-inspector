/* eslint-disable no-useless-escape */
import { computed } from '@ember/object';

import BasicAdapter from './basic';

export default class Bookmarklet extends BasicAdapter {
  name = 'bookmarklet';

  /**
   * Called when the adapter is created.
   *
   * @method init
   */
  init() {
    this._connect();
    return super.init(...arguments);
  }

  @computed
  get inspectedWindow() {
    return window.opener || window.parent;
  }

  @computed
  get inspectedWindowURL() {
    return loadPageVar('inspectedWindowURL');
  }

  sendMessage(options) {
    options = options || {};
    this.inspectedWindow.postMessage(options, this.inspectedWindowURL);
  }

  /**
   * Redirect to the correct inspector version.
   *
   * @method onVersionMismatch
   * @param {String} goToVersion
   */
  onVersionMismatch(goToVersion) {
    this.sendMessage({ name: 'version-mismatch', version: goToVersion });
    window.location.href = `../panes-${goToVersion.replace(
      /\./g,
      '-',
    )}/index.html${window.location.search}`;
  }

  _connect() {
    window.addEventListener('message', (e) => {
      let message = e.data;
      if (e.origin !== this.inspectedWindowURL) {
        return;
      }
      // close inspector if inspected window is unloading
      if (message && message.unloading) {
        window.close();
      }
      if (message.from === 'inspectedWindow') {
        this._messageReceived(message);
      }
    });
  }
}

function loadPageVar(sVar) {
  return decodeURI(
    window.location.search.replace(
      new RegExp(
        `^(?:.*[&\\?]${encodeURI(sVar).replace(
          /[\.\+\*]/g,
          '\\$&',
        )}(?:\\=([^&]*))?)?.*$`,
        'i',
      ),
      '$1',
    ),
  );
}
