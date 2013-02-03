
// console styles for conncetions adn disconnections
var consoleStyle = {
    "green": "background: #eeeeee; padding: 5px; color: green; font-weight: bold;",
    "red": "background: #eeeeee; padding: 5px; color: red; font-weight: bold;"
};

var ports = {};

chrome.extension.onConnect.addListener(function(port) {
  // this is when a devtool, panel or content creates a port
  // so we record it most the time we don't care about any other than the first
  // 3 but gotta handle what comes
  if (port.name !== "devtools" && port.name !== "panel" && port.name !== "content") return;
  console.log("%cPort Opened: [" + port.portId_ + "] " + port.name , consoleStyle['green']);

  if (typeof ports[port.name] === "undefined") {
    ports[port.name] = {};
  }
  ports[port.name][port.portId_] = port;

  // when a tab, panel or devtool is closed this will fire
  // if you need to clean up something on close make sure its a port that we care about
  port.onDisconnect.addListener(function(port) {
    console.log("%cPort Closed: [" + port.portId_ + "] " + port.name, consoleStyle['red']);
    delete ports[port.name][port.portId_];
  });

  // this is where panel connects with inspected (via content)
  // it isn't configured correctly yet because the message format isn't in stone yet
  // but a quick description of how it will be is below
  port.onMessage.addListener(function(msg) {

    // this is hacks what needs to happen is this: when panel posts its first message it should be
    // sending the the value of chrome.devtools.inspectedWindow.tabId along with the message ...
    // use that tabId with posts['content'] to find our port (9 times out of 10 theres only going to
    // be one but thats not the point) once the portId of the correct content script is found that
    // portId should be added to the ports['panel'] entry and this panels portId should be added to the
    // ports['content'] entry we id'd by tabid ...

    if (msg.dest === "panel" && msg.src === "inspected") {
      var forward = ports['panel'][Object.getOwnPropertyNames(ports['panel'])[0]];
      forward.postMessage(msg);
    }
    if (msg.dest === "inspected" && msg.src === "panel" ) {
      var forward = ports['content'][Object.getOwnPropertyNames(ports['content'])[0]];
      forward.postMessage(msg);
    }

  });

});


