import versionTest from '../utils/version-test.js';
import { EMBER_VERSIONS_SUPPORTED } from '../utils/versions.js';
import {
  getApplicationWithDescriptors,
  sendApplications,
  getApplicationInstance,
} from './applications.js';
import bootEmberInspector from './boot-ember-inspector.js';
import setupInstanceInitializer from './setup-instance-initializer.js';
import sendVersionMiss from './send-version-miss.js';
import getEmberDebug from '../main.js';
import { guidFor, Application, VERSION } from './ember.js';
import { onEmberReady } from '../utils/on-ready.js';

function appStarted(instance) {
  const app = instance.application;

  if (!('__inspector__booted' in app)) {
    // Watch for app reset/destroy
    app.reopen({
      reset: function () {
        this.__inspector__booted = false;
        this._super.apply(this, arguments);
      },
    });
  }

  if (instance && !('__inspector__booted' in instance)) {
    instance.reopen({
      // Clean up on instance destruction
      willDestroy() {
        if (window.EmberInspector.owner === instance) {
          window.EmberInspector.destroyContainer();
          window.EmberInspector.clear();
        }
        return this._super.apply(this, arguments);
      },
    });

    if (!window.EmberInspector._application) {
      setTimeout(() => bootEmberInspector(instance), 0);
    }
  }
}

async function startInspector(Adapter) {
  // global to prevent injection
  if (window.NO_EMBER_DEBUG) {
    return;
  }

  /**
   * If we don't have a way to know the Ember version at this point
   * because the Ember app has not loaded and provided it somehow,
   * we can't continue (we need the version to know what version of
   * the Inspector to load).
   */
  if (!VERSION) {
    return;
  }

  /**
   * This is used to redirect to an old snapshot of the Inspector if the
   * inspected app uses an older Ember version than supported versions.
   * The code fits the Inspector supporting Ember back to 3.16: any version
   * before 3.16 is necessarily a classic Ember app with Ember defined.
   */
  if ((VERSION, !versionTest(VERSION, EMBER_VERSIONS_SUPPORTED))) {
    // Wrong inspector version. Redirect to the correct version.
    sendVersionMiss(VERSION);
    return;
  }

  // prevent from injecting twice
  if (window.EmberInspector) {
    return;
  }

  window.EmberInspector = getEmberDebug();
  window.EmberInspector.Adapter = Adapter;

  const adapterInstance = new Adapter();

  // There's probably a better way
  // to determine when the application starts
  // but this definitely works
  adapterInstance.onMessageReceived(function (message) {
    if (message.type === 'app-picker-loaded') {
      sendApplications(adapterInstance, getApplicationWithDescriptors());
    }

    if (message.type === 'app-selected') {
      const current = window.EmberInspector._application;
      const selected = getApplicationWithDescriptors().find(
        (app) => guidFor(app) === message.applicationId,
      );

      if (selected && current !== selected) {
        const instance = getApplicationInstance(selected);

        if (instance) {
          bootEmberInspector(instance);
        }
      }
    }
  });

  const apps = getApplicationWithDescriptors();

  sendApplications(adapterInstance, apps);

  const loadInstance = (app) => {
    const instance = getApplicationInstance(app);

    if (instance) {
      // App started
      setupInstanceInitializer(app, appStarted);
      appStarted(instance);
      return true;
    }
  };

  for (const app of apps) {
    // We check for the existance of an application instance because
    // in Ember > 3 tests don't destroy the app when they're done but the app has no booted instances.
    if (app._readinessDeferrals === 0) {
      if (loadInstance(app)) {
        break;
      }
    }

    // app already run initializers, but no instance, use _bootPromise and didBecomeReady
    if (app._bootPromise) {
      app._bootPromise.then((app) => {
        loadInstance(app);
      });
    }

    app.reopen({
      didBecomeReady() {
        this._super.apply(this, arguments);
        setTimeout(() => loadInstance(app), 0);
      },
    });
  }

  Application.initializer({
    name: 'ember-inspector-booted',
    initialize: (app) => {
      setupInstanceInitializer(app, appStarted);
    },
  });
}

/**
 * Wait for document and Ember to be ready before beginning with the Inspector start
 * @param {*} Adapter
 */
export default (Adapter) => onEmberReady(() => startInspector(Adapter));
