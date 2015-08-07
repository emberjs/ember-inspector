import Ember from "ember";
const { RSVP: { Promise }, Route } = Ember;

export default Route.extend({
  beforeModel() {
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

  renderTemplate() {
    this.render('promises.error');
  }
});
