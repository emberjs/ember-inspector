chrome.experimental.devtools.console.addMessage("warning", "Hi!");
var panel = chrome.devtools.panels.create("Ember", "images/hamster.png", "panes/object-inspector.html", function(panel) {
  panel.onShown.addListener(function(win) {
    debugger;
    console.log(win);
  });
});

