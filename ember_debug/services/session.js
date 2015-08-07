const Ember = window.Ember;
const { Object: EmberObject } = Ember;

const Session = EmberObject.extend({
  setItem: function(/*key, val*/) {},
  removeItem: function(/*key*/) {},
  getItem: function(/*key*/) {}
});

// Feature detection
if (typeof sessionStorage !== 'undefined') {
  Session.reopen({
    sessionStorage: sessionStorage,
    prefix: '__ember__inspector__',
    makeKey(key) {
      return this.prefix + key;
    },
    setItem(key, val) {
      return this.sessionStorage.setItem(this.makeKey(key), val);
    },
    removeItem(key) {
      return this.sessionStorage.removeItem(this.makeKey(key));
    },
    getItem(key) {
      return JSON.parse(this.sessionStorage.getItem(this.makeKey(key)));
    }
  });
}

export default Session;
