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
import Service, { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type { AnyFn } from 'ember/-private/type-utils';
import config from 'ember-inspector/config/environment';
import type PortService from '../port';
import type { Message } from '../port';

export default class Basic extends Service {
  @service declare port: PortService;

  _messageCallbacks: Array<AnyFn>;
  name = 'basic';

  @tracked canOpenResource = false;

  /**
   * Called when the adapter is created (when
   * the inspector app boots).
   */
  constructor(properties?: object) {
    super(properties);
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
   * @param _neededVersion (The version to go to)
   */
  onVersionMismatch(_neededVersion?: string) {}

  /**
    Used to send messages to EmberDebug

    @param _message the message to send
  **/
  sendMessage(_message: Partial<Message>) {}

  /**
    Register functions to be called
    when a message from EmberDebug is received
  **/
  onMessageReceived(callback: AnyFn) {
    this._messageCallbacks.push(callback);
  }

  _messageReceived(...args: Array<any>) {
    this._messageCallbacks.forEach((callback) => {
      callback(...args);
    });
  }

  reloadTab?(): void;
  // Called when the "Reload" is clicked by the user
  willReload() {}
  openResource(_file: string, _line: number) {}

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

/**
 * Compares two Ember versions.
 *
 * Returns:
 * `-1` if version < version
 * 0 if version1 == version2
 * 1 if version1 > version2
 *
 * @return result of the comparison
 */
function compareVersion(version1: string, version2: string) {
  const v1 = cleanupVersion(version1).split('.');
  const v2 = cleanupVersion(version2).split('.');
  for (let i = 0; i < 3; i++) {
    // @ts-expect-error TODO: refactor this to make TS happy
    let compared = compare(+v1[i], +v2[i]);
    if (compared !== 0) {
      return compared;
    }
  }
  return 0;
}

/* Remove -alpha, -beta, etc from versions */
function cleanupVersion(version: string) {
  return version.replace(/-.*/g, '');
}

function compare(val: number, number: number) {
  if (val === number) {
    return 0;
  } else if (val < number) {
    return -1;
  } else if (val > number) {
    return 1;
  }
}
