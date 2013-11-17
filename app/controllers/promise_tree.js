var PromiseTreeController = Ember.ArrayController.extend({
  // children: Ember.computed.filterBy('filtered', 'pendingBranch', true),
  children: Ember.computed.alias('filtered'),

  filtered: Ember.computed.filterBy('model', 'parent', null)
});

export default PromiseTreeController;
