import Ember from "ember";
const { Route, RSVP: { Promise } } = Ember;

export default Route.extend({
  model: function() {
    const port = this.get('port');
    return new Promise(function(resolve) {
      port.one('container:types', function(message) {
        resolve(message.types);
      });
      port.send('container:getTypes');
    });
  },
  actions: {
    reload: function() {
      this.refresh();
    }
  }
});
