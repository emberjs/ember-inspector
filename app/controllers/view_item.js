var not = Ember.computed.not;
var oneWay = Ember.computed.oneWay;
var bool = Ember.computed.bool;

export default Ember.ObjectController.extend({
  needs: ['view-tree'],
  viewTree: oneWay('controllers.view-tree').readOnly(),

  hasView: not('model.value.isVirtual'),
  hasElement: not('model.value.isVirtual'),

  isCurrent: function() {
    return this.get('viewTree.pinnedObjectId') === this.get('model.value.objectId');
  }.property('controllers.viewTree.pinnedObjectId', 'model.value.objectId'),

  hasController: bool('model.value.controller'),

  hasModel: bool('model.value.model'),

  modelInspectable: function() {
    return this.get('hasModel') && this.get('value.model.type') === 'type-ember-object';
  }.property('hasModel', 'value.model.type'),

  labelStyle: function() {
    return 'padding-left: ' + ((+this.get('model.parentCount') * 20) + 5) + "px";
  }.property('model.parentCount'),

  actions: {
    inspectView: function() {
      if (this.get('hasView')) {
        this.get('target').send('inspect', this.get('value.objectId'));
      }
    },
    inspectElement: function(objectId) {
      if (!objectId && this.get('hasElement')) {
        objectId = this.get('value.objectId');
      }

      if (objectId) {
        this.get('target').send('inspectElement', objectId);
      }
    },
    inspectModel: function(objectId) {
      if (this.get('modelInspectable')) {
        this.get('target').send('inspect', objectId);
      }
    }
  }

});
