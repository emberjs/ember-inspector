import Router from "router";
import Resolver from "resolver";

var App = Ember.Application.extend({
  modulePrefix: '',
  Resolver: Resolver,
  Router: Router
});

export default App;
