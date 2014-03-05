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
      } else {
        window.addEventListener('Ember.Application', callback, false);
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

  function hijackDefine(callback) {
    window.define = (function (define) {
      return function (id, deps, factory) {
        if (typeof id !== 'string') {
          factory = deps;
          deps = id;
          id = null;
        }
        if (!deps instanceof Array || typeof deps.push !== 'function') {
          factory = deps;
          deps = [];
        }
        factory = (function (factory) {
          return function () {
            if (typeof factory === 'function') {
              factory = factory.apply(this, arguments);
            }
            if (typeof window.Ember !== 'undefined') {
              onApplicationStart(callback);
              window.define = define;
            }
            return factory;
          }
        })(factory);
        define.apply(this, id ? [id, deps, factory] : [deps, factory]);
      }
    })(window.define);
  }

  // There's probably a better way
  // to determine when the application starts
  // but this definitely works
  function onApplicationStart(callback) {
    if (typeof Ember === 'undefined') {
      if (typeof window.define === 'function' && window.define.amd) {
        hijackDefine(callback);
      }
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

}(currentAdapter));
