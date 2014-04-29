function onEmberInspectorMessage(message) {
  console.debug("content-script: ember debug receive", message);

  let event = document.createEvent("CustomEvent");

  // FIX: needed to fix permission denied exception on Firefox >= 30
  // - https://github.com/emberjs/ember-inspector/issues/147
  // - https://blog.mozilla.org/addons/2014/04/10/changes-to-unsafewindow-for-the-add-on-sdk/
  try {
    message = cloneInto(message, document.defaultView);
  } catch(e) {
    message = JSON.stringify(message);
  }

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
