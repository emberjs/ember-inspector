import WebExtension from "./web-extension";

export default WebExtension.extend({
  name: 'chrome',

  canOpenResource: true,

  openResource(file, line) {
    /*global chrome */
    // For some reason it opens the line after the one specified
    chrome.devtools.panels.openResource(file, line - 1);
  },

  onResourceAdded() {
    chrome.devtools.inspectedWindow.onResourceAdded.addListener(opts => {
      if (opts.type === 'document') {
        this.sendIframes([opts.url]);
      }
    });
  }
});
