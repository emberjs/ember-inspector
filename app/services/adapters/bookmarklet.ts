import BasicAdapter from './basic';
import type { Message } from '../port';

export default class Bookmarklet extends BasicAdapter {
  name = 'bookmarklet';

  /**
   * Called when the adapter is created.
   */
  constructor() {
    // @ts-expect-error Using ...arguments is fine.
    // eslint-disable-next-line prefer-rest-params
    super(...arguments);

    this._connect();
  }

  get inspectedWindow() {
    return (window.opener as Window | undefined) || window.parent;
  }

  get inspectedWindowURL() {
    return loadPageVar('inspectedWindowURL');
  }

  sendMessage(message?: Partial<Message>) {
    this.inspectedWindow.postMessage(message ?? {}, this.inspectedWindowURL);
  }

  /**
   * Redirect to the correct inspector version.
   */
  onVersionMismatch(goToVersion: string) {
    this.sendMessage({ name: 'version-mismatch', version: goToVersion });
    window.location.href = `../panes-${goToVersion.replace(
      /\./g,
      '-',
    )}/index.html${window.location.search}`;
  }

  _connect() {
    window.addEventListener('message', (e) => {
      const message = e.data as Message;
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

function loadPageVar(sVar: string) {
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
