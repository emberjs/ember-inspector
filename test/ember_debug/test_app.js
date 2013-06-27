var App, compile = Ember.Handlebars.compile;

Em.run(function() {
  App = window.App = Em.Application.create();

  App.Router.map(function() {
    this.route('simple');
    this.resource('posts');
  });

  App.deferReadiness();
  App.setupForTesting();
  App.injectTestHelpers();
});

App.SimpleView = Em.View.extend({
  tagName: 'div'
});

App.SimpleRoute = Em.Route.extend({
  model: function() {
    return {
      toString: function() {
        return 'Simple Model';
      }
    };
  }
});

App.SimpleController = Em.ObjectController.extend();

Ember.TEMPLATES.application = compile('{{outlet}}');
Ember.TEMPLATES.index = compile('Index');
Ember.TEMPLATES.simple = compile('Simple');
Ember.TEMPLATES.posts = compile('Posts');


export = App;
