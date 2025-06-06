let Ember;

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
/* globals adapter, env */
var currentAdapter = 'basic';
if (typeof adapter !== 'undefined') {
  currentAdapter = adapter;
}
var currentEnv = 'production';
if (typeof env !== 'undefined') {
  currentEnv = env;
}

// @formatter:off
var EMBER_VERSIONS_SUPPORTED = {{EMBER_VERSIONS_SUPPORTED}};
// @formatter:on

(function(adapter) {
  onEmberReady(function() {
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
      sendVersionMiss();
      return;
    }

    // prevent from injecting twice
    if (!window.EmberInspector) {
      // Make sure we only work for the supported version
      define('ember-debug/config', function() {
        return {
          default: {
            environment: currentEnv
          }
        };
      });

      let emberDebugMainModule = requireModule('ember-debug/main');
      if (!emberDebugMainModule['default']) {
        return;
      }
      window.EmberInspector = emberDebugMainModule['default'];
      window.EmberInspector.Adapter = requireModule('ember-debug/adapters/' + adapter)['default'];

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
              if (window.EmberInspector.owner === instance) {
                window.EmberInspector.destroyContainer();
                window.EmberInspector.clear();
              }
              return this._super.apply(this, arguments);
            }
          });

          if (!window.EmberInspector._application) {
            setTimeout(() => bootEmberInspector(instance), 0);
          }
        }
      });
    }
  });

  function bootEmberInspector(appInstance) {
    appInstance.application.__inspector__booted = true;
    appInstance.__inspector__booted = true;

    // Boot the inspector (or re-boot if already booted, for example in tests)
    window.EmberInspector._application = appInstance.application;
    window.EmberInspector.owner = appInstance;
    window.EmberInspector.start(true);
  }

  function onEmberReady(callback) {
    var triggered = false;
    var triggerOnce = function(string) {
      if (triggered) {
        return;
      }

      if (!Ember) {
        try {
          Ember = requireModule('ember/barrel')['default'];
        } catch {}
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

  // There's probably a better way
  // to determine when the application starts
  // but this definitely works
  function onApplicationStart(callback) {
    if (typeof Ember === 'undefined') {
      return;
    }

    const adapterInstance = new (requireModule('ember-debug/adapters/' + currentAdapter)['default']);

    adapterInstance.onMessageReceived(function(message) {
      if (message.type === 'app-picker-loaded') {
        sendApps(adapterInstance, getApplications());
      }

      if (message.type === 'app-selected') {
        let current = window.EmberInspector._application;
        let selected = getApplications().find(app => Ember.guidFor(app) === message.applicationId);

        if (selected && current !== selected && selected.__deprecatedInstance__) {
          bootEmberInspector(selected.__deprecatedInstance__);
        }
      }
    });

    var apps = getApplications();

    sendApps(adapterInstance, apps);

    function loadInstance(app) {
      const applicationInstances = app._applicationInstances && [...app._applicationInstances]
      let instance = app.__deprecatedInstance__ || applicationInstances[0];
      if (instance) {
        // App started
        setupInstanceInitializer(app, callback);
        callback(instance);
        return true
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
      if(app._bootPromise) {
        app._bootPromise.then((app) => {
          loadInstance(app);
        });
      }

      app.reopen({
        didBecomeReady() {
          this._super.apply(this, arguments);
          setTimeout(() => loadInstance(app), 0)
        }
      });

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

  /**
   * Get all the Ember.Application instances from Ember.Namespace.NAMESPACES
   * and add our own applicationId and applicationName to them
   * @return {*}
   */
  function getApplications() {
    var namespaces = Ember.A(Ember.Namespace.NAMESPACES);

    var apps = namespaces.filter(function(namespace) {
      return namespace instanceof Ember.Application;
    });

    return apps.map(function(app) {
      // Add applicationId and applicationName to the app
      var applicationId = Ember.guidFor(app);
      var applicationName = app.name || app.modulePrefix || `(unknown app - ${applicationId})`;

      Object.assign(app, {
        applicationId,
        applicationName
      });

      return app;
    });
  }

  let channel = new MessageChannel();
  let port = channel.port1;
  window.postMessage('debugger-client', '*', [channel.port2]);

  let registeredMiss = false;

  /**
   * This function is called if the app's Ember version
   * is not supported by this version of the inspector.
   *
   * It sends a message to the inspector app to redirect
   * to an inspector version that supports this Ember version.
   */
  function sendVersionMiss() {
    if (registeredMiss) {
      return;
    }

    registeredMiss = true;

    port.addEventListener('message', message => {
      if (message.type === 'check-version') {
        sendVersionMismatch();
      }
    });

    sendVersionMismatch();

    port.start();

    function sendVersionMismatch() {
      port.postMessage({
        name: 'version-mismatch',
        version: Ember.VERSION,
        from: 'inspectedWindow'
      });
    }
  }

  function sendApps(adapter, apps) {
    const serializedApps = apps.map(app => {
      return {
        applicationName: app.applicationName,
        applicationId: app.applicationId
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

  function onReady(callback) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(completed);
    } else {
      document.addEventListener("DOMContentLoaded", completed, false);
      // For some reason DOMContentLoaded doesn't always work
      window.addEventListener("load", completed, false);
    }

    function completed() {
      document.removeEventListener("DOMContentLoaded", completed, false);
      window.removeEventListener("load", completed, false);
      callback();
    }
  }

  /**
   * Compares two Ember versions.
   *
   * Returns:
   * `-1` if version1 < version
   * 0 if version1 == version2
   * 1 if version1 > version2
   *
   * @param {String} version1
   * @param {String} version2
   * @return {Boolean} result of the comparison
   */
  function compareVersion(version1, version2) {
    let compared, i;
    version1 = cleanupVersion(version1).split('.');
    version2 = cleanupVersion(version2).split('.');
    for (i = 0; i < 3; i++) {
      compared = compare(+version1[i], +version2[i]);
      if (compared !== 0) {
        return compared;
      }
    }
    return 0;
  }

  /**
   * Remove -alpha, -beta, etc from versions
   *
   * @param {String} version
   * @return {String} The cleaned up version
   */
  function cleanupVersion(version) {
    return version.replace(/-.*/g, '');
  }

  /**
   * @method compare
   * @param {Number} val
   * @param {Number} number
   * @return {Number}
   *  0: same
   * -1: <
   *  1: >
   */
  function compare(val, number) {
    if (val === number) {
      return 0;
    } else if (val < number) {
      return -1;
    } else if (val > number) {
      return 1;
    }
  }

}(currentAdapter));
