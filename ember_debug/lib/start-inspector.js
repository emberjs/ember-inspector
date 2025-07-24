/* eslint-disable ember/new-module-imports, ember/no-test-import-export */

import versionTest from './version-test';
import { EMBER_VERSIONS_SUPPORTED } from './versions';
import sendApps from './send-apps';
import getApplications from './get-applications';
import bootEmberInspector from './boot-ember-inspector';
import setupInstanceInitializer from './setup-instance-initializer';
import sendVersionMiss from './send-version-miss';

let Ember;

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

    if (!Ember) {
      try {
        Ember = requireModule('ember/barrel')['default'];
      } catch {
        // noop
      }
      try {
        Ember = Ember || requireModule('ember')['default'];
      } catch {
        Ember = window.Ember;
      }
    }

    if (!Ember) {
      return;
    }
    // `Ember.Application` load hook triggers before all of Ember is ready.
    // In this case we ignore and wait for the `Ember` load hook.
    if (!Ember.RSVP) {
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
    if (typeof Ember === 'undefined') {
      return;
    }

    const adapterInstance = new adapter();

    adapterInstance.onMessageReceived(function (message) {
      if (message.type === 'app-picker-loaded') {
        sendApps(adapterInstance, getApplications(Ember));
      }

      if (message.type === 'app-selected') {
        let current = window.EmberInspector._application;
        let selected = getApplications(Ember).find(
          (app) => Ember.guidFor(app) === message.applicationId,
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

    var apps = getApplications(Ember);

    sendApps(adapterInstance, apps);

    function loadInstance(app) {
      const applicationInstances = app._applicationInstances && [
        ...app._applicationInstances,
      ];
      let instance = app.__deprecatedInstance__ || applicationInstances[0];
      if (instance) {
        // App started
        setupInstanceInitializer(Ember, app, callback);
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
    Ember.Application.initializer({
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

    // If Ember doesn't exist, we should stop here to avoid issues with accessing `Ember.VERSION`
    if (!Ember) {
      return;
    }

    if (!versionTest(Ember.VERSION, EMBER_VERSIONS_SUPPORTED)) {
      // Wrong inspector version. Redirect to the correct version.
      sendVersionMiss(Ember);
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
