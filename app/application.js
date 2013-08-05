import Router from "router";
import resolver from "resolver";

var App = Ember.Application.extend({
  modulePrefix: '',
  resolver: resolver,
  Router: Router
});

export default App;
