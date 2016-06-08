import Ember from "ember";
const { computed } = Ember;
const { oneWay } = computed;

export default Ember.Controller.extend({
  needs: ['model-types'],

  modelTypes: oneWay('controllers.model-types').readOnly(),

  selected: computed('modelTypes.selected', function() {
    return this.get('model') === this.get('modelTypes.selected');
  })
});
