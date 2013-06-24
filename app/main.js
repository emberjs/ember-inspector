import "application" as App;
import "views/tree_node" as TreeNodeView;
import "views/tree_node_controller" as TreeNodeControllerView;
import "port" as Port;

var EmberExtension;

EmberExtension = App.create();
EmberExtension.TreeNodeView = TreeNodeView;
EmberExtension.TreeNodeControllerView = TreeNodeControllerView;
EmberExtension.Port = Port;


chrome.devtools.network.onNavigated.addListener(function() {
  location.reload(true);
});

function injectDebugger() {

  var xhr = new XMLHttpRequest();
  xhr.open("GET", chrome.extension.getURL('/ember_debug/ember_debug.js'), false);
  xhr.send();
  var emberDebug = '(function() { ' + xhr.responseText + ' }());';

  chrome.devtools.inspectedWindow.eval(emberDebug);
}

injectDebugger();



export EmberExtension;
