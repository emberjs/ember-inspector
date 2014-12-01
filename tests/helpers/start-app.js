import Ember from 'ember';
import Application from '../../app';
import Router from '../../router';
import config from '../../config/environment';
var guidFor = Ember.guidFor;

export default function startApp(attrs) {
  var App;

  var attributes = Ember.merge({}, config.APP);
  attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

  Router.reopen({
    location: 'none'
  });

  Ember.run(function() {
    App = Application.create(attributes);
    App.setupForTesting();
    App.injectTestHelpers();
  });

  App.initializer({
    name: guidFor(App) + "-detectEmberApplication",
    initialize: function(container, application) {
      container.lookup('route:application-detected').reopen({
        model: Ember.K,
      });
    }
  });

  App.reset(); // this shouldn't be needed, i want to be able to "start an app at a specific URL"

  return App;
}


// TODO: separate each helper in its own file

Ember.Test.registerHelper('findByLabel', function(app, label, context) {
  var selector = '[data-label="' + label + '"]';
  var result = app.testHelpers.find(selector, context);

  return result;
});

Ember.Test.registerAsyncHelper('clickByLabel', function(app, label, context) {
  return app.testHelpers.click('[data-label="' + label + '"]', context);
});

Ember.Test.registerAsyncHelper('mouseEnterByLabel', function(app, selector, context) {
  app.testHelpers.findByLabel(selector, context).trigger('mouseenter');
  return wait();
});

Ember.Test.registerAsyncHelper('mouseLeaveByLabel', function(app, selector, context) {
  app.testHelpers.findByLabel(selector, context).trigger('mouseleave');
  return wait();
});

// The below were copied when migrating from grunt system.
// Should fix later

Ember.View.reopen({
  attributeBindings: ['label:data-label'],
  label: null
});
