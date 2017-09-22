/**
 * The Chrome and Firefox extensions inject the in-page-script into the
 * page to determine the version of Ember the ClientApp is running.
 *
 * An iife runs to gather the data and uses postMessage to send the data back
 * to the extension.
 *
 * @namespace EmberInspector/Shared
 * @class InPageScript
 */
(function() {
  "use strict";
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

  onReady(function() {
    var libraries = window.Ember && window.Ember.libraries;
    if (libraries) {
      // Ember has changed where the array of libraries is located.
      // In older versions, `Ember.libraries` was the array itself,
      // but now it's found under _registry.
      if (libraries._registry) {
        libraries = libraries._registry;
      }

      var versions = Array.prototype.slice.call(libraries, 0);
      window.postMessage({
        type: 'emberVersion',
        versions: versions
      }, '*');
    }
  });
}());
