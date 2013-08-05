import "application" as App;
import "views/tree_node_controller" as TreeNodeControllerView;
import "views/property_field" as PropertyFieldView;
import "components/drag_handle" as DragHandleComponent;
import "port" as Port;

var EmberExtension;

EmberExtension = App.create();
EmberExtension.TreeNodeControllerView = TreeNodeControllerView;
EmberExtension.PropertyFieldView = PropertyFieldView;
EmberExtension.DragHandleComponent = DragHandleComponent;
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


export = EmberExtension;
