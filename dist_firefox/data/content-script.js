function onEmberInspectorMessage(message) {
  console.debug("content-script: ember debug receive", message);

  let event = document.createEvent("CustomEvent");
  event.initCustomEvent("ember-debug-receive", true, true, message);
  document.documentElement.dispatchEvent(event);
}

function onEmberDebugEvent(event) {
  console.debug("content-script: ember debug send", event.detail);

  self.port.emit("message", event.detail);
}

console.log("EXECUTING EMBER DEBUG BRIDGE on: ", document.defaultView.location.toString());

document.addEventListener("ember-debug-send", onEmberDebugEvent, false);

self.port.on("message", onEmberInspectorMessage);

// let ember-debug know that content script has executed
document.documentElement.dataset.emberExtension = 1;
