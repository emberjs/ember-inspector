/* eslint camelcase:0 */
/**
 This is a wrapper for `ember-debug.js`
 Wraps the script in a function,
 and ensures that the script is executed
 only after the dom is ready
 and the application has initialized.

 Also responsible for sending the first tree.
 **/
/*eslint prefer-spread: 0 */
/* globals Ember, adapter, env, requireModule */
var currentAdapter = 'basic';
if (typeof adapter !== 'undefined') {
  currentAdapter = adapter;
}
var currentEnv = 'production';
if (typeof env !== 'undefined') {
  currentEnv = env;
}

var EMBER_VERSIONS_SUPPORTED = {{EMBER_VERSIONS_SUPPORTED}};

(function(adapter) {
  var onReady = requireModule('ember-debug/utils/on-ready').onReady;
  var compareVersion = requireModule('ember-debug/utils/version').compareVersion;

  onEmberReady(function() {
    // global to prevent injection
    if (window.NO_EMBER_DEBUG) {
      return;
    }

    if (!versionTest(Ember.VERSION, EMBER_VERSIONS_SUPPORTED)) {
      // Wrong inspector version. Redirect to the correct version.
      sendVersionMiss();
      return;
    }
    // prevent from injecting twice
    if (!Ember.EmberInspectorDebugger) {
      // Make sure we only work for the supported version
      define('ember-debug/config', function() {
        return {
          default: {
            environment: currentEnv
          }
        };
      });
      window.EmberInspector = Ember.EmberInspectorDebugger = requireModule('ember-debug/main')['default'];
      Ember.EmberInspectorDebugger.Adapter = requireModule('ember-debug/adapters/' + adapter)['default'];

      onApplicationStart(function appStarted(instance) {
        let app = instance.application;
        if (!('__inspector__booted' in app)) {
          // Watch for app reset/destroy
          app.reopen({
            reset: function() {
              this.__inspector__booted = false;
              this._super.apply(this, arguments);
            }
          });
        }

        if (instance && !('__inspector__booted' in instance)) {
          instance.reopen({
            // Clean up on instance destruction
            willDestroy() {
              if (Ember.EmberInspectorDebugger.get('owner') === instance) {
                Ember.EmberInspectorDebugger.destroyContainer();
                Ember.EmberInspectorDebugger.clear();
              }
              return this._super.apply(this, arguments);
            }
          });

          if (!Ember.EmberInspectorDebugger._application) {
            bootEmberInspector(instance);
          }
        }
      });
    }
  });

  function bootEmberInspector(appInstance) {
    appInstance.application.__inspector__booted = true;
    appInstance.__inspector__booted = true;

    // Boot the inspector (or re-boot if already booted, for example in tests)
    Ember.EmberInspectorDebugger.set('_application', appInstance.application);
    Ember.EmberInspectorDebugger.set('owner', appInstance);
    Ember.EmberInspectorDebugger.start(true);
  }

  function onEmberReady(callback) {
    var triggered = false;
    var triggerOnce = function(string) {
      if (triggered) {
        return;
      }
      if (!window.Ember) {
        return;
      }
      // `Ember.Application` load hook triggers before all of Ember is ready.
      // In this case we ignore and wait for the `Ember` load hook.
      if (!window.Ember.RSVP) {
        return;
      }
      triggered = true;
      callback();
    };

    // Newest Ember versions >= 1.10
    window.addEventListener('Ember', triggerOnce, false);
    // Old Ember versions
    window.addEventListener('Ember.Application', function() {
      if (window.Ember && window.Ember.VERSION && compareVersion(window.Ember.VERSION, '1.10.0') === 1) {
        // Ember >= 1.10 should be handled by `Ember` load hook instead.
        return;
      }
      triggerOnce();
    }, false);
    // Oldest Ember versions or if this was injected after Ember has loaded.
    onReady(triggerOnce);
  }

  // There's probably a better way
  // to determine when the application starts
  // but this definitely works
  function onApplicationStart(callback) {
    if (typeof Ember === 'undefined') {
      return;
    }

    const adapterInstance = requireModule('ember-debug/adapters/' + currentAdapter)['default'].create();

    adapterInstance.onMessageReceived(function(message) {
      if (message.type !== 'app-picker-loaded') {
        return;
      }

      sendApps(adapterInstance, getApplications());
    });

    adapterInstance.onMessageReceived(function(message) {
      if (message.type !== 'app-selected') {
        return;
      }

      const appInstance = getApplications().find(app => Ember.guidFor(app) === message.applicationId);

      if (appInstance && appInstance.__deprecatedInstance__) {
        bootEmberInspector(appInstance.__deprecatedInstance__);
      }
    });

    var apps = getApplications();

    sendApps(adapterInstance, apps);

    var app;
    for (var i = 0, l = apps.length; i < l; i++) {
      app = apps[i];
      // We check for the existance of an application instance because
      // in Ember > 3 tests don't destroy the app when they're done but the app has no booted instances.
      if (app._readinessDeferrals === 0) {
        let instance = app.__deprecatedInstance__ || (app._applicationInstances && app._applicationInstances[0]);
        if (instance) {
          // App started
          setupInstanceInitializer(app, callback);
          callback(instance);
          break;
        }
      }
    }
    Ember.Application.initializer({
      name: 'ember-inspector-booted',
      initialize: function(app) {
        setupInstanceInitializer(app, callback);
      }
    });
  }

  function setupInstanceInitializer(app, callback) {
    if (!app.__inspector__setup) {
      app.__inspector__setup = true;

      // We include the app's guid in the initializer name because in Ember versions < 3
      // registering an instance initializer with the same name, even if on a different app,
      // triggers an error because instance initializers seem to be global instead of per app.
      app.instanceInitializer({
        name: 'ember-inspector-app-instance-booted-' + Ember.guidFor(app),
        initialize: function(instance) {
          callback(instance);
        }
      });
    }
  }

  function getApplications() {
    var namespaces = Ember.A(Ember.Namespace.NAMESPACES);

    return namespaces.filter(function(namespace) {
      return namespace instanceof Ember.Application;
    });
  }

  /**
   * This function is called if the app's Ember version
   * is not supported by this version of the inspector.
   *
   * It sends a message to the inspector app to redirect
   * to an inspector version that supports this Ember version.
   */
  function sendVersionMiss() {
    var adapter = requireModule('ember-debug/adapters/' + currentAdapter)['default'].create();
    adapter.onMessageReceived(function(message) {
      if (message.type === 'check-version') {
        sendVersionMismatch();
      }
    });
    sendVersionMismatch();

    function sendVersionMismatch() {
      adapter.sendMessage({
        name: 'version-mismatch',
        version: Ember.VERSION,
        from: 'inspectedWindow'
      });
    }
  }

  function sendApps(adapter, apps) {
    const serializedApps = apps.map(app => {
      return {
        applicationName: app.name || 'Application',
        applicationId: Ember.guidFor(app)
      }
    });

    adapter.sendMessage({
      type: 'apps-loaded',
      apps: serializedApps,
      from: 'inspectedWindow'
    });
  }

  /**
   * Checks if a version is between two different versions.
   * version should be >= left side, < right side
   *
   * @param {String} version1
   * @param {String} version2
   * @return {Boolean}
   */
  function versionTest(version, between) {
    var fromVersion = between[0];
    var toVersion = between[1];

    if (compareVersion(version, fromVersion) === -1) {
      return false;
    }
    return !toVersion || compareVersion(version, toVersion) === -1;
  }

}(currentAdapter));
