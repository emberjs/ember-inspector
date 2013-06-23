/**
  This is a wrapper for `ember-debug.js`
  Wraps the script in a function,
  and ensures that the script is executed
  only after the dom is ready
  and the application has initialized.

  Also responsible for sending the first tree.
**/
(function() {

  function start() {
    {{emberDebug}}
  }

  onReady(function() {
    if (!Ember.Debug) {
      start();
    }
    Ember.Debug.sendTree();
  });


  function onReady(callback) {
    if (document.readyState === 'complete') {
      onApplicationStart(callback);
    } else {
      document.addEventListener( "DOMContentLoaded", function(){
        document.removeEventListener( "DOMContentLoaded", arguments.callee, false );
        onApplicationStart(callback);
      }, false );
    }
  }

  // There's probably a better way
  // to determine when the application starts
  // but this definitely works
  function onApplicationStart(callback) {
    if (!Ember) {
      return;
    }
    var body = document.getElementsByTagName('body')[0];
    var interval = setInterval(function() {
      if (body.dataset.contentScriptLoaded && hasViews()) {
       clearInterval(interval);
       callback();
      }
    }, 10);
  }

  function hasViews() {
    var views = Ember.View.views;
    for(var i in views) {
      if (views.hasOwnProperty(i)) {
        return true;
      }
    }
    return false;
  }

}());
