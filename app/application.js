import "router" as Router;
import "resolver" as resolver;

var App = Ember.Application.extend({
  modulePrefix: '',
  resolver: resolver,
  Router: Router
});

export = App;
