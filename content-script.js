// check if theres been sufficient time and no ember-application class
// if so we don't really need to do anything
if (document.readyState == "complete") {
  emberCheck()
} else {
  window.addEventListener("load", function () {
    setTimeout(emberCheck, 0);
  });
}

// ember-application found? proceed
function emberCheck() {
  if (document.getElementsByClassName('ember-application').length > 0) {
    emberFound();
  }
}

function emberFound() {
  var port = chrome.extension.connect({ name: 'content' });

  port.onMessage.addListener(function (msg) {
    // msgs that are on their way to 'inspected' arrive here
    if (msg.dest !== 'inspected') {
      // messagees sent to content script it self would be handled here
    } else {
    window.postMessage(msg, "*");
    }
  });

  window.addEventListener("message", (function (event) {
    // when messages come back from the inspected page they arrive here
    // this is usually going to be with a payload on its way to the panel
    var data = event.data;
    console.log("message", event);
    if (data.dest !== "inspected") {
      port.postMessage(data);
    }
  }), false);



  // this is our script injection via script tag
  var s = document.createElement('script');

  s.src = chrome.extension.getURL('panes/ember-debug.js');

  s.onload = function () {
    s.parentNode.removeChild(s);
  };

  document.head.appendChild(s);

}