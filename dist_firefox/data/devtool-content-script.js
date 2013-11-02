let contentWindow = document.defaultView;

console.log("EXECUTING EMBER DEVTOOL BRIDGE on: ", contentWindow.location.toString());

document.addEventListener("ember-extension-send", function onEmberExtensionEvent(event) {
  console.debug("devtool-content-script: send", event.detail);

  self.port.emit("message", event.detail);
}, false);

self.port.on("message", function onEmberDebugMessage(message) {
  console.debug("devtool-content-script: receive", message);

  if (message.reload) {
    window.location.reload(true);
  } else {
    let event = document.createEvent("CustomEvent");
    event.initCustomEvent("ember-extension-receive", true, true, message);
    if (document.documentElement) {
      document.documentElement.dispatchEvent(event);
    }
  }
});
