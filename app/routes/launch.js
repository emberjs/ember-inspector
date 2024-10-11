import { inject as service } from '@ember/service';
import { readOnly } from '@ember/object/computed';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
const { Promise } = RSVP;
import { LOCAL_STORAGE_SUPPORTED } from 'ember-inspector/services/storage/local';

const chromeStoreSupported = !!window.chrome && !!window.chrome.storage;
const storageSupported = chromeStoreSupported || LOCAL_STORAGE_SUPPORTED;
const STORE_KEY = 'last-version-opened';

export default class LaunchRoute extends Route {
  @service config;
  @service storage;
  @service router;

  @readOnly('config.VERSION') version;

  beforeModel() {
    let targetRoute = 'component-tree';
    const currentVersion = this.version;

    return this.lastVersionOpened().then((lastVersion) => {
      this.setLastVersionOpened(currentVersion);
      if (
        storageSupported &&
        window.compareVersions(currentVersion, lastVersion) > 0
      ) {
        targetRoute = 'whats-new';
      }

      this.router.transitionTo(targetRoute);
    });
  }

  lastVersionOpened() {
    if (chromeStoreSupported) {
      return new Promise(function (resolve) {
        window.chrome.storage.local.get([STORE_KEY], function (obj) {
          resolve((obj[STORE_KEY] || 0).toString());
        });
      });
    } else {
      return RSVP.resolve((this.storage.getItem(STORE_KEY) || 0).toString());
    }
  }

  setLastVersionOpened(version) {
    if (chromeStoreSupported) {
      return new Promise(function (resolve) {
        window.chrome.storage.local.set(
          {
            [STORE_KEY]: version,
          },
          function () {
            resolve();
          },
        );
      });
    } else {
      this.storage.setItem(STORE_KEY, version);
      return RSVP.resolve();
    }
  }
}
