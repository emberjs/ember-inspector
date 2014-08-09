import BasicAdapter from "adapters/basic";

var emberDebug = null;

export default  BasicAdapter.extend({
  name: 'bookmarklet',

  inspectedWindowURL: function() {
    return loadPageVar('inspectedWindowURL');
  }.property(),

  sendMessage: function(options) {
    options = options || {};
    window.opener.postMessage(options, this.get('inspectedWindowURL'));
  },

  _connect: function() {
    var self = this;

    window.addEventListener('message', function(e) {
      var message = e.data;
      if (e.origin !== self.get('inspectedWindowURL')) {
        return;
      }
      // close inspector if inspected window is unloading
      if (message && message.unloading) {
        window.close();
      }
      if (message.from === 'inspectedWindow') {
        self._messageReceived(message);
      }
    });
  }.on('init'),
});

function loadPageVar (sVar) {
  return decodeURI(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}
