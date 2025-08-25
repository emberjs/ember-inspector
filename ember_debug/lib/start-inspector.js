/* eslint-disable ember/no-test-import-export */
import versionTest from './version-test';
import { EMBER_VERSIONS_SUPPORTED } from './versions';
import sendApps from './send-apps';
import getApplications from './get-applications';
import bootEmberInspector from './boot-ember-inspector';
import setupInstanceInitializer from './setup-instance-initializer';
import sendVersionMiss from './send-version-miss';
import { guidFor, Application } from '../utils/ember';

function onReady(callback) {
  if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
  ) {
    setTimeout(completed);
  } else {
    document.addEventListener('DOMContentLoaded', completed, false);
    // For some reason DOMContentLoaded doesn't always work
    window.addEventListener('load', completed, false);
  }

  function completed() {
    document.removeEventListener('DOMContentLoaded', completed, false);
    window.removeEventListener('load', completed, false);
    callback();
  }
}

export function onEmberReady(callback) {
  var triggered = false;
  var triggerOnce = function () {
    if (triggered) {
      return;
    }

    triggered = true;
    callback();
  };

  // Newest Ember versions >= 1.10

  const later = () => setTimeout(triggerOnce, 0);
  window.addEventListener('Ember', later, { once: true });
  // Oldest Ember versions or if this was injected after Ember has loaded.
  onReady(triggerOnce);
}

export function startInspector(adapter) {
  // There's probably a better way
  // to determine when the application starts
  // but this definitely works
  function onApplicationStart(callback) {
    const adapterInstance = new adapter();

    adapterInstance.onMessageReceived(function (message) {
      if (message.type === 'app-picker-loaded') {
        sendApps(adapterInstance, getApplications());
      }

      if (message.type === 'app-selected') {
        let current = window.EmberInspector._application;
        let selected = getApplications().find(
          (app) => guidFor(app) === message.applicationId,
        );

        if (
          selected &&
          current !== selected &&
          selected.__deprecatedInstance__
        ) {
          bootEmberInspector(selected.__deprecatedInstance__);
        }
      }
    });

    var apps = getApplications();

    sendApps(adapterInstance, apps);

    function loadInstance(app) {
      const applicationInstances = app._applicationInstances && [
        ...app._applicationInstances,
      ];
      let instance = app.__deprecatedInstance__ || applicationInstances[0];
      if (instance) {
        // App started
        setupInstanceInitializer(app, callback);
        callback(instance);
        return true;
      }
    }

    var app;
    for (var i = 0, l = apps.length; i < l; i++) {
      app = apps[i];
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
      initialize: function (app) {
        setupInstanceInitializer(app, callback);
      },
    });
  }

  return async function startInspector() {
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
    if (!globalThis.Ember && !globalThis.emberInspectorApps) {
      return;
    }

    /**
     * This is used to redirect to an old snapshot of the Inspector if the
     * inspected app uses an older Ember version than supported versions.
     * The code fits the Inspector supporting Ember back to 3.16: any version
     * before 3.16 is necessarily a classic Ember app with Ember defined.
     */
    if (
      globalThis.Ember &&
      globalThis.Ember.VERSION &&
      !versionTest(globalThis.Ember.VERSION, EMBER_VERSIONS_SUPPORTED)
    ) {
      // Wrong inspector version. Redirect to the correct version.
      sendVersionMiss(globalThis.Ember);
      return;
    }

    // prevent from injecting twice
    if (!window.EmberInspector) {
      let emberDebugMainModule = (await import('../main')).default;
      if (!emberDebugMainModule) {
        return;
      }
      window.EmberInspector = emberDebugMainModule;
      window.EmberInspector.Adapter = adapter;

      onApplicationStart(function appStarted(instance) {
        let app = instance.application;
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
      });
    }
  };
}
