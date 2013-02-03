
chrome.devtools.panels.create("EmberDebug", "images/hamster.png", "panes/object-inspector.html", function (panel) {

  // panelWindow will be the window of the panel, however it doesn't exist until the panel is shown so
  // any messages sent before panelWindow exists will be queued for delivery in data[]
  // lastly the port this instance of devtools will use to talk to our inspected page...
  // by way of its content script... by way of the extensions single background page ...
  var panelWindow = undefined,
      data = [],
      port = chrome.extension.connect({ name: 'devtools' });

  port.onMessage.addListener(function (msg) {

    if (panelWindow) {
      this.handleMsg(msg);
    } else {
      data.push(msg);
    }
  });

  // handle any data[]
  panel.onShown.addListener(function (window) {
    // only gotta do it once
    panel.onShown.removeListener(this);

    panelWindow = window;

    var msg;
    while (msg = data.shift()) {
      this.handleMsg(msg);
    }
    panelWindow.respond = function (msg) {
      port.postMessage(msg);
    };

  });

});
