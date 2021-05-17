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
import EmberObject from '@ember/object';
import { tracked } from '@glimmer/tracking';
import config from 'ember-inspector/config/environment';

export default class Basic extends EmberObject {
  @tracked canOpenResource = false;
  name = 'basic';

  /**
   * Called when the adapter is created (when
   * the inspector app boots).
   *
   * @method init
   */
  init() {
    super.init(...arguments);
    this._messageCallbacks = [];
    this._checkVersion();
  }

  /**
   * Listens to `EmberInspectorDebugger` message about
   * Ember version mismatch. If a mismatch message is received
   * it means the current inspector app does not support the current
   * Ember version and needs to switch to an inspector version
   * that does.
   *
   * @method _checkVersion
   * @private
   */
  _checkVersion() {
    this.onMessageReceived((message) => {
      let { name, version } = message;
      if (name === 'version-mismatch') {
        let previousVersions = config.previousEmberVersionsSupported;
        let [fromVersion, tillVersion] = config.emberVersionsSupported;
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
   * @method onVersionMismatch
   * @param {String} neededVersion (The version to go to)
   */
  onVersionMismatch() {}

  /**
    Used to send messages to EmberDebug

    @param type {Object} the message to the send
  **/
  sendMessage() {}

  /**
    Register functions to be called
    when a message from EmberDebug is received
  **/
  onMessageReceived(callback) {
    this._messageCallbacks.push(callback);
  }

  _messageReceived(message) {
    this._messageCallbacks.forEach((callback) => {
      callback(message);
    });
  }

  // Called when the "Reload" is clicked by the user
  willReload() {}
  openResource /* file, line */() {}
}

/**
 * Compares two Ember versions.
 *
 * Returns:
 * `-1` if version < version
 * 0 if version1 == version2
 * 1 if version1 > version2
 *
 * @param {String} version1
 * @param {String} version2
 * @return {Boolean} result of the comparison
 */
function compareVersion(version1, version2) {
  version1 = cleanupVersion(version1).split('.');
  version2 = cleanupVersion(version2).split('.');
  for (let i = 0; i < 3; i++) {
    let compared = compare(+version1[i], +version2[i]);
    if (compared !== 0) {
      return compared;
    }
  }
  return 0;
}

/* Remove -alpha, -beta, etc from versions */
function cleanupVersion(version) {
  return version.replace(/-.*/g, '');
}

function compare(val, number) {
  if (val === number) {
    return 0;
  } else if (val < number) {
    return -1;
  } else if (val > number) {
    return 1;
  }
}
