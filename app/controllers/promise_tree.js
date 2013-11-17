var PromiseTreeController = Ember.ArrayController.extend({
  children: Ember.computed.filterBy('model', 'parent', null),
});

export default PromiseTreeController;
