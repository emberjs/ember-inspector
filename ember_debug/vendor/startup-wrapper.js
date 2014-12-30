/**
  This is a wrapper for `ember-debug.js`
  Wraps the script in a function,
  and ensures that the script is executed
  only after the dom is ready
  and the application has initialized.

  Also responsible for sending the first tree.
**/

/* globals Ember, adapter, requireModule */

var currentAdapter = 'basic';
if (typeof adapter !== 'undefined') {
  currentAdapter = adapter;
}

(function(adapter) {

  function inject() {
    window.EmberInspector = Ember.Debug = requireModule('ember-debug/main')['default'];
  }

  onEmberReady(function() {
    if (!window.Ember) {
      return;
    }
    // global to prevent injection
    if (window.NO_EMBER_DEBUG) {
      return;
    }
    // prevent from injecting twice
    if (!Ember.Debug) {
      inject();
      Ember.Debug.Adapter = requireModule('ember-debug/adapters/' + adapter)['default'];

      onApplicationStart(function() {
        Ember.Debug.start();
      });
    }
  });

  function onEmberReady(callback) {
    var triggered = false;
    var triggerOnce = function() {
      if (triggered) { return; }
      triggered = true;
      callback();
    };
    window.addEventListener('Ember.Application', triggerOnce, false);
    onReady(function() {
      if (window.Ember) {
        triggerOnce();
      }
    });
  }

  function onReady(callback) {
    if (document.readyState === 'complete') {
      setTimeout(completed);
    } else {
      document.addEventListener( "DOMContentLoaded", completed, false);
      // For some reason DOMContentLoaded doesn't always work
      window.addEventListener( "load", completed, false );
    }

    function completed() {
      document.removeEventListener( "DOMContentLoaded", completed, false );
      window.removeEventListener( "load", completed, false );
      callback();
    }
  }

  // There's probably a better way
  // to determine when the application starts
  // but this definitely works
  function onApplicationStart(callback) {
    if (typeof Ember === 'undefined') {
      return;
    }
    if (!Ember.BOOTED) {
      Ember.Application.initializer({
        name: 'ember-inspector-booted',
        initialize: function(container, application) {
          application.booted = true;
          callback();
        }
      });
    } else {
      callback();
    }
  }

}(currentAdapter));
