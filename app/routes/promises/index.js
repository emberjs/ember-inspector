import Ember from "ember";
const { RSVP: { Promise }, Route } = Ember;

export default Route.extend({
  beforeModel: function() {
    return new Promise(resolve => {
      this.get('port').one('promise:supported', message => {
        if (message.supported) {
          this.transitionTo('promise-tree');
        } else {
          resolve();
        }
      });
      this.get('port').send('promise:supported');
    });
  },

  renderTemplate: function() {
    this.render('promises.error');
  }
});
