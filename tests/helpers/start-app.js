import Ember from 'ember';
import Application from '../../app';
import Router from '../../router';
import config from '../../config/environment';
import triggerPort from './trigger-port';
let { generateGuid } = Ember;

export default function startApp(attrs) {
  let application;

  let attributes = Ember.merge({}, config.APP);
  attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

  Application.initializer({
    name: generateGuid() + "-detectEmberApplication",
    initialize: function(container) {
      container.lookup('route:app-detected').reopen({
        model: Ember.K
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
Ember.Test.registerAsyncHelper('mouseEnter', function(app, selector, context) {
  find(selector, context).trigger('mouseenter');
  return wait();
});

Ember.Test.registerAsyncHelper('mouseLeave', function(app, selector, context) {
  find(selector, context).trigger('mouseleave');
  return wait();
});
