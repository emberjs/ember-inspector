import "router" as Router;
import "resolver" as resolver;

var App = Ember.Application.extend({
  modulePrefix: '',
  resolver: resolver,
  Router: Router,
  windowFocus: function(event) {
    if (event.target.document.nodeType === Node.DOCUMENT_NODE) {
      document.body.classList.remove('inactive');
    }
  },
  windowBlur: function(event) {
    if (event.target.document.nodeType === Node.DOCUMENT_NODE) {
      document.body.classList.add('inactive');
    }
  },
  init: function() {
    this._super();
    window.addEventListener('focus', this.windowFocus, false);
    window.addEventListener('blur',  this.windowBlur,  false);
  }
});

export = App;
