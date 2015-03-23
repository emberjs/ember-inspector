import Ember from "ember";
const { computed, Component } = Ember;
const { not, bool } = computed;

export default Component.extend({
  classNames: ['list-tree__item', 'row'],

  classNameBindings: ['isCurrent:row_highlight'],

  hasView: not('model.value.isVirtual'),
  hasElement: not('model.value.isVirtual'),
  hasModel: bool('model.value.model'),

  // passed as an attribute
  pinnedObjectId: null,

  isCurrent: function() {
    return this.get('pinnedObjectId') === this.get('model.value.objectId');
  }.property('pinnedObjectId', 'model.value.objectId'),

  hasController: bool('model.value.controller'),

  modelInspectable: function() {
    return this.get('hasModel') && this.get('model.value.model.type') === 'type-ember-object';
  }.property('hasModel', 'model.value.model.type'),

  labelStyle: function() {
    return 'padding-left: ' + ((+this.get('model.parentCount') * 20) + 5) + "px";
  }.property('model.parentCount'),

  actions: {
    inspectView() {
      if (this.get('hasView')) {
        this.sendAction('inspect', this.get('model.value.objectId'));
      }
    },
    inspectElement(objectId) {
      if (!objectId && this.get('hasElement')) {
        objectId = this.get('model.value.objectId');
      }

      if (objectId) {
        this.sendAction('inspectElement', objectId);
      }
    },
    inspectModel(objectId) {
      if (this.get('modelInspectable')) {
        this.sendAction('inspect', objectId);
      }
    }
  }

});

