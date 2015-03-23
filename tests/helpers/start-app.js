import Ember from 'ember';
import Application from '../../app';
import Router from '../../router';
import config from '../../config/environment';
let { generateGuid } = Ember;

export default function startApp(attrs) {
  var application;

  var attributes = Ember.merge({}, config.APP);
  attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

  Application.initializer({
    name: generateGuid() + "-detectEmberApplication",
    initialize: function(container, application) {
      container.lookup('route:app-detected').reopen({
        model: Ember.K,
      });
    }
  });

  Ember.run(function() {
    application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
  });


  return application;
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
