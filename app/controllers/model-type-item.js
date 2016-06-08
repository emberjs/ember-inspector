import Ember from "ember";
const { computed, inject } = Ember;

export default Ember.Controller.extend({
  modelTypes: inject.controller('model-types'),

  selected: computed('modelTypes.selected', function() {
    return this.get('model') === this.get('modelTypes.selected');
  })
});
