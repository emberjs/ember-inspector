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
  xhr.open("GET", chrome.extension.getURL('/assets/ember-debug.js'), false);
  xhr.send();
  var emberDebug = xhr.responseText;

  xhr = new XMLHttpRequest();
  xhr.open("GET", chrome.extension.getURL('/assets/startup_wrapper.js'), false);
  xhr.send();
  var startupWrapper = xhr.responseText;

  // make sure ember debug runs
  // after application has initialized
  emberDebug = startupWrapper.replace("{{emberDebug}}", emberDebug);

  chrome.devtools.inspectedWindow.eval(emberDebug);
}

injectDebugger();



export EmberExtension;
