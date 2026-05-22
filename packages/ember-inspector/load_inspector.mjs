/* eslint-env browser */

(function () {
  'use strict';

  function getScriptURL() {
    var scripts = document.getElementsByTagName('script');
    if (scripts && scripts.length) {
      for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src && scripts[i].src.match(/load_inspector.mjs$/)) {
          return scripts[i].src.replace(/\/load_inspector.mjs$/, '');
        }
      }
    }
    return null;
  }

  var url = getScriptURL();
  var windowUrl =
    url +
    '/bookmarklet/' +
    '?inspectedWindowURL=' +
    locationOrigin();
  var inspectorWindow;

  var pathArray = url.split('/');
  var base = pathArray[0] + '//' + pathArray[2];


  inspectorWindow = window.open(encodeURI(windowUrl), 'ember-inspector');

  window.emberInspector = {
    w: inspectorWindow,
    url: base,
  };

  if (!window.emberInspector) {
    alert(
      'Unable to open the inspector in a popup.  Please enable popups and retry.',
    );
    return;
  }
  document.documentElement.dataset.emberExtension = 1;

  function injectEmberDebug(fileName) {
    var script = document.createElement('script');
    script.type = 'module';
    script.src = url + '/' + fileName;
    document.body.appendChild(script);
  }

  injectEmberDebug('ember_debug.mjs');

  function locationOrigin() {
    var origin = window.location.origin;
    if (!origin) {
      origin =
        window.location.protocol +
        '//' +
        window.location.hostname +
        (window.location.port ? ':' + window.location.port : '');
    }
    return origin;
  }
})();
