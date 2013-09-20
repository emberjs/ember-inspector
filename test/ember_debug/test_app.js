var App, compile = Ember.Handlebars.compile;

Em.run(function() {
  App = window.App = Em.Application.create();

  App.Router.map(function() {
    this.route('simple');
    this.resource('posts');
    this.resource('comments', function() {
      this.route('new');
      this.route('edit', { path: '/edit/:comment_id' });
    });
  });

  App.deferReadiness();
  App.setupForTesting();
  App.injectTestHelpers();
});

App.SimpleView = Em.View.extend({
  tagName: 'div',
  classNames: ['my-simple-view']
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
Ember.TEMPLATES.simple = compile('Simple {{input class="simple-input"}} {{view Ember.View classNames="simple-view"}}');
Ember.TEMPLATES.posts = compile('Posts');


export defaultApp;
