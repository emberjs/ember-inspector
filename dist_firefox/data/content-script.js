function onEmberInspectorMessage(message) {
  console.debug("content-script: ember debug receive", message);

  handleEmberDebugUrl(message) || routeToEmberDebug(message);
}

function onEmberDebugEvent(event) {
  console.debug("content-script: ember debug send", event.detail);

  self.port.emit("message", event.detail);
}

function handleEmberDebugUrl(message) {
  if (message.emberDebugUrl) {
    console.debug("ember_debug.js url received: ", message);
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.onload = function() {
      console.log("EMBER DEBUG LOADED");
      script.onload = null;
    };
    var head = document.querySelector("head");
    if (head) {
      head.appendChild( script );
      script.src = message.emberDebugUrl;

      return true;
    }
  }

  return false;
}

function routeToEmberDebug(message) {
  let event = document.createEvent("CustomEvent");
  event.initCustomEvent("ember-debug-receive", true, true, message);
  document.documentElement.dispatchEvent(event);
}

self.port.on("message", onEmberInspectorMessage);

let contentWindow = document.defaultView;

console.log("EXECUTING EMBER DEBUG BRIDGE on: ", contentWindow.location.toString());

document.addEventListener("ember-debug-send", onEmberDebugEvent, false);

// let ember-debug know that content script has executed
if (document.body) {
  document.body.dataset.emberExtension = 1;
}
