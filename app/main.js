import App from "application";
import TreeNodeControllerView from "views/tree_node_controller";
import PropertyFieldView from "views/property_field" ;
import Port from "port";

var EmberExtension;

EmberExtension = App.create();
EmberExtension.TreeNodeControllerView = TreeNodeControllerView;
EmberExtension.PropertyFieldView = PropertyFieldView;
EmberExtension.Port = Port;


if (typeof chrome !== 'undefined' && chrome.devtools) {
  chrome.devtools.network.onNavigated.addListener(function() {
    location.reload(true);
  });

  injectDebugger();
}

function injectDebugger() {

  var xhr = new XMLHttpRequest();
  xhr.open("GET", chrome.extension.getURL('/ember_debug/ember_debug.js'), false);
  xhr.send();
  var emberDebug = '(function() { ' + xhr.responseText + ' }());';

  chrome.devtools.inspectedWindow.eval(emberDebug);
}


export defaultEmberExtension;
