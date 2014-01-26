export default Ember.Route.extend({
  model: function() {
    return this.get('assembler.topSort');
  },

  activate: function() {
    this.get('assembler').start();
  },

  deactivate: function() {
    this.get('assembler').stop();
  },

  actions: {
    sendValueToConsole: function(promise) {
      this.get('port').send('promise:sendValueToConsole', { promiseId: promise.get('guid') });
    }
  }
});
