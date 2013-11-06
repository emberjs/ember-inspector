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

  function inject() {
    Ember.Debug = requireModule('ember_debug');
  }

  onReady(function() {
    // global to prevent injection
    if (window.NO_EMBER_DEBUG) {
      return;
    }
    // prevent from injecting twice
    if (!Ember.Debug) {
      inject();
      Ember.Debug.promiseAssembler = requireModule('lib/promise_assembler').create();
      Ember.Debug.promiseAssembler.start();
    }
    Ember.Debug.Adapter = requireModule('adapters/' + adapter);

    onApplicationStart(function() {
      Ember.Debug.start();
    });
  });

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
      console.log('completed');
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
    var body = document.body;
    var interval = setInterval(function() {
      if (body.dataset.emberExtension && Ember.BOOTED) {
       clearInterval(interval);
       callback();
      }
    }, 1);
  }

}(currentAdapter));
