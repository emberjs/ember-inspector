import "application" as App;
import "views/tree_node" as TreeNodeView;
import "views/tree_node_controller" as TreeNodeControllerView;

var EmberExtension;

window.resetDebugger = function() {
  EmberExtension.__container__.lookup('controller:mixinStack').set('model', []);
};

window.activate = function() {
  EmberExtension = App.create();
  EmberExtension.TreeNodeView = TreeNodeView;
  EmberExtension.TreeNodeControllerView = TreeNodeControllerView;
  window.resetDebugger();
};

window.updateObject = function(options) {
  var details = options.details,
      name = options.name,
      property = options.property,
      objectId = options.objectId;

  Ember.NativeArray.apply(details);
  details.forEach(arrayize);

  var controller = EmberExtension.__container__.lookup('controller:Application');

  if (options.parentObject) {
    controller.pushMixinDetails(name, property, objectId, details);
  } else {
    controller.activateMixinDetails(name, details, objectId);
  }
};

window.updateProperty = function(options) {
  var detail = EmberExtension.__container__.lookup('controller:mixinDetails').get('mixins').objectAt(options.mixinIndex);
  var property = Ember.get(detail, 'properties').findProperty('name', options.property);
  Ember.set(property, 'calculated', options.value);
};

window.viewTree = function(options) {
  var viewTree = EmberExtension.__container__.lookup('controller:viewTree');
  viewTree.set('node', { children: [ arrayizeTree(options.tree) ] });
};

function arrayize(mixin) {
  Ember.NativeArray.apply(mixin.properties);
}

function arrayizeTree(tree) {
  Ember.NativeArray.apply(tree.children);
  tree.children.forEach(arrayizeTree);
  return tree;
}







var port = chrome.extension.connect();
port.postMessage({ appId: chrome.devtools.inspectedWindow.tabId });

port.onMessage.addListener(function(message) {
  var toSend;

  if (message.type === 'viewTree') {
    toSend = { name: 'viewTree', args: [message] };
  } else if (message.details) {
    toSend = { name: 'updateObject', args: [message] };
  } else if (message.property) {
    toSend = { name: 'updateProperty', args: [message] };
  }

  window[toSend.name].apply(window, toSend.args);
});

var queuedSend, panelVisible;

window.activate();

window.calculate = function(objectId, property, mixinIndex) {
  port.postMessage({ from: 'devtools', type: 'calculate', objectId: objectId, property: property.name, mixinIndex: mixinIndex });
};

window.digDeeper = function(objectId, property) {
  port.postMessage({ from: 'devtools', type: 'digDeeper', objectId: objectId, property: property.name });
};

window.releaseObject = function(objectId) {
  port.postMessage({ from: 'devtools', type: 'releaseObject', objectId: objectId });
};

window.showLayer = function(objectId) {
  port.postMessage({ from: 'devtools', type: 'showLayer', objectId: objectId });
};

window.hideLayer = function(objectId) {
  port.postMessage({ from: 'devtools', type: 'hideLayer', objectId: objectId });
};

window.getTree = function() {
  port.postMessage({ from: 'devtools', type: 'getTree' });
};

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
