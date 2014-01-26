var oneWay = Ember.computed.oneWay;

export default Ember.ObjectController.extend({
  needs: ['model-types'],

  modelTypes: oneWay('controllers.model-types').readOnly(),
  collapsed: oneWay('modelTypes.collapsed').readOnly(),

  selected: function() {
    return this.get('model') === this.get('modelTypes.selected');
  }.property('modelTypes.selected')
});
