(function($) {
  "use strict";
  if (!$) { return; }
  $(function() {
    var libraries = window.Ember && window.Ember.libraries;
    if (libraries) {
      var versions = Array.prototype.slice.call(libraries, 0);
      window.postMessage({
        type: 'emberVersion',
        versions: versions
      }, '*');
    }
  });
}(window.jQuery));
