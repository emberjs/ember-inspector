Ember.testing = true;

Ember.Test.registerHelper('findByLabel', function(app, label, context) {
  return app.testHelpers.find('[data-label="' + label + '"]', context);
});

Ember.Test.registerHelper('clickByLabel', function(app, label, context) {
  return app.testHelpers.click('[data-label="' + label + '"]', context);
});

Ember.Test.registerHelper('mouseEnterByLabel', function(app, selector, context) {
  app.testHelpers.findByLabel(selector, context).trigger('mouseenter');
  return wait();
});

Ember.Test.registerHelper('mouseLeaveByLabel', function(app, selector, context) {
  app.testHelpers.findByLabel(selector, context).trigger('mouseleave');
  return wait();
});

Ember.View.reopen({
  attributeBindings: ['label:data-label'],
  label: null
});
