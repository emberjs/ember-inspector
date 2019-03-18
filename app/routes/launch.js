import Route from '@ember/routing/route';
import RSVP from 'rsvp';
const { Promise } = RSVP;
import { readOnly } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import LocalStorageService from 'ember-inspector/services/storage/local';

const chromeStoreSupported = (!!window.chrome && !!window.chrome.storage);
const localStoreSupported = LocalStorageService.SUPPORTED;
const storageSupported = chromeStoreSupported || localStoreSupported;
const STORE_KEY = 'last-version-opened';

export default Route.extend({
  version: readOnly('config.VERSION'),
  storage: service(`storage/${LocalStorageService.STORAGE_TYPE_TO_USE}`),


  lastVersionOpened() {
    if (chromeStoreSupported) {
      return new Promise(function(resolve) {
        window.chrome.storage.local.get([STORE_KEY], function(obj) {
          resolve(
            (obj[STORE_KEY] || 0).toString()
          );
        });
      });
    }
    else if (localStoreSupported) {
      return RSVP.resolve(
        (this.get('storage').getItem(STORE_KEY) || 0).toString()
      );
    }

    return RSVP.resolve(
      (0).toString()
    );
  },

  setLastVersionOpened(version) {
    if (chromeStoreSupported) {
      return new Promise(function(resolve) {
        window.chrome.storage.local.set({
          [STORE_KEY]: version
        }, function() {
          resolve();
        });
      });
    }

    else if (localStoreSupported) {
      this.get('storage').setItem(STORE_KEY, version);
      return RSVP.resolve();
    }
  },

  beforeModel() {
    let targetRoute = 'component-tree';
    const currentVersion = this.get('version');

    return this.lastVersionOpened().then((lastVersion) => {
      this.setLastVersionOpened(currentVersion);
      if (storageSupported && (window.compareVersions(currentVersion, lastVersion) > 0)) {
        targetRoute = 'whats-new';
      }

      this.transitionTo(targetRoute);
    });
  }
});
