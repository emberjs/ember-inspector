import App from "application";
import DragHandleComponent from "components/drag_handle";
import PropertyFieldComponent from "components/property_field";
import Port from "port";

var EmberExtension;

EmberExtension = App.create();
EmberExtension.DragHandleComponent = DragHandleComponent;
EmberExtension.PropertyFieldComponent = PropertyFieldComponent;
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


export default EmberExtension;
