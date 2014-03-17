/**
  This is a wrapper for `ember-debug.js`
  Wraps the script in a function,
  and ensures that the script is executed
  only after the dom is ready
  and the application has initialized.

  Also responsible for sending the first tree.
**/

var currentAdapter = 'basic';
if (typeof adapter !== 'undefined') {
  currentAdapter = adapter;
}

(function(adapter) {

  // RSVP promise inspection
  // First thing because of
  var events = [], callbacks = {};
  if (!window.__PROMISE_INSTRUMENTATION__) {
    callbacks = window.__PROMISE_INSTRUMENTATION__ = {};
    var eventNames = ['created', 'fulfilled', 'rejected', 'chained'];

    for (var i = 0; i < eventNames.length; i++) {
      (function(eventName) {
        callbacks[eventName] = function(options) {
          events.push({
            eventName: eventName,
            options: options
          });
        };
      }(eventNames[i]));

    }
  }


  function inject() {
    Ember.Debug = requireModule('ember_debug')['default'];
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
      Ember.Debug.Adapter = requireModule('adapters/' + adapter)['default'];

      onApplicationStart(function() {
        Ember.Debug.setProperties({
          existingEvents: events,
          existingCallbacks: callbacks
        });
        Ember.Debug.start();
      });
    }
  });

  function onEmberReady(callback) {
    onReady(function() {
      if (window.Ember) {
        callback();
        return;
      }

      // If here, there is either no Ember, or Ember is being loaded
      // asynchronously. Give it half a second, and then clean up.
      var asyncEmberTimeout = setTimeout(function() {
        removeData(document.documentElement, 'emberExtension');
        removeData(document.body, 'emberExtension');
        window.removeListener('Ember.Application', invokeCallback, false);
      }, 500);

      window.addEventListener('Ember.Application', invokeCallback, false);

      function invokeCallback() {
        clearTimeout(asyncEmberTimeout);
        callback();
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
    var documentElement = document.documentElement;
    var interval = setInterval(function() {
      if (documentElement.dataset.emberExtension && Ember.BOOTED) {
       clearInterval(interval);
       callback();
      }
    }, 1);
  }

  function removeData(el, name) {
    if (el && el.dataset.hasOwnProperty(name)) {
      delete el.dataset[name]
    }
  }

}(currentAdapter));
