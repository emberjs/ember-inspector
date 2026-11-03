/**
 * The adapter stores logic specific to each environment.
 * Extend this object with env specific code (such as chrome/firefox/test),
 * then set the application's `adapter` property to the name of this adapter.
 *
 * example:
 *
 * ```javascript
 * const EmberInspector = App.Create({
 *   adapter: 'chrome'
 * });
 * ```
 */
import Service, { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { compareVersion } from 'ember-debug/version';

export default class Basic extends Service {
  @service port;

  name = 'basic';

  @tracked canOpenResource = false;

  /**
   * Called when the adapter is created (when
   * the inspector app boots).
   */
  constructor() {
    super(...arguments);

    this._messageCallbacks = [];
    this._checkVersion();
  }

  /**
   * Listens to Ember Inspector message about
   * Ember version mismatch. If a mismatch message is received
   * it means the current inspector app does not support the current
   * Ember version and needs to switch to an inspector version
   * that does.
   *
   * @private
   */
  _checkVersion() {
    this.onMessageReceived((message) => {
      const { name, version } = message;
      if (name === 'version-mismatch') {
        const previousVersions = import.meta.env
          .PREVIOUS_EMBER_VERSIONS_SUPPORTED;
        const [fromVersion, tillVersion] = import.meta.env
          .EMBER_VERSIONS_SUPPORTED;
        let neededVersion;

        if (compareVersion(version, fromVersion) === -1) {
          neededVersion = previousVersions[previousVersions.length - 1];
        } else if (tillVersion && compareVersion(version, tillVersion) !== -1) {
          neededVersion = tillVersion;
        } else {
          return;
        }
        this.onVersionMismatch(neededVersion);
      }
    });
    this.sendMessage({ type: 'check-version', from: 'devtools' });
  }

  /**
   * Hook called when the Ember version is not
   * supported by the current inspector version.
   *
   * Each adapter should implement this hook
   * to switch to an older/new inspector version
   * that supports this Ember version.
   *
   * @param _neededVersion (The version to go to)
   */
  onVersionMismatch(/* _neededVersion */) {}

  /**
    Used to send messages to EmberDebug

    @param _message the message to send
  **/
  sendMessage(/* _message */) {}

  /**
    Register functions to be called
    when a message from EmberDebug is received
  **/
  onMessageReceived(callback) {
    this._messageCallbacks.push(callback);
  }

  _messageReceived(...args) {
    this._messageCallbacks.forEach((callback) => {
      callback(...args);
    });
  }

  // Called when the "Reload" is clicked by the user
  willReload() {}

  openResource(/* _file, _line */) {}

  @action
  refreshPage() {
    // If the adapter defined a `reloadTab` method, it means
    // they prefer to handle the reload themselves
    if (typeof this.reloadTab === 'function') {
      this.reloadTab();
    } else {
      // inject ember_debug as quickly as possible in chrome
      // so that promises created on dom ready are caught
      this.port.send('general:refresh');
      this.willReload();
    }
  }
}
