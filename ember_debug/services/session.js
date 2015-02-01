var Ember = window.Ember;
var EmberObject = Ember.Object;

var Session = EmberObject.extend({
  setItem: function(/*key, val*/) {},
  removeItem: function(/*key*/) {},
  getItem: function(/*key*/) {}
});

// Feature detection
if (typeof sessionStorage !== 'undefined') {
  Session.reopen({
    sessionStorage: sessionStorage,
    prefix: '__ember__inspector__',
    makeKey: function(key) {
      return this.prefix + key ;
    },
    setItem: function(key, val) {
      return this.sessionStorage.setItem(this.makeKey(key), val);
    },
    removeItem: function(key) {
      return this.sessionStorage.removeItem(this.makeKey(key));
    },
    getItem: function(key) {
      return JSON.parse(this.sessionStorage.getItem(this.makeKey(key)));
    }
  });
}

export default Session;
