var App;

Em.run(function() {
  App = window.App = Em.Application.create();

  App.Router.map(function() {
    this.resource('posts');
  });

  App.deferReadiness();
  App.setupForTesting();
  App.injectTestHelpers();
});

App.IndexRoute = Em.Route.extend({
  model: function() {
    return { name: 'Teddy' };
  }
});

Ember.TEMPLATES.index = Ember.Handlebars.compile('Home');
Ember.TEMPLATES.posts = Ember.Handlebars.compile('Posts');

export = App;
