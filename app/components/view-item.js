import Ember from "ember";
const { computed, Component, String: { htmlSafe } } = Ember;
const { not, bool } = computed;

export default Component.extend({
  classNames: ['list__row'],

  hasView: not('model.value.isVirtual'),
  hasElement: not('model.value.isVirtual'),
  hasModel: bool('model.value.model'),

  hasController: bool('model.value.controller'),

  modelInspectable: computed('hasModel', 'model.value.model.type', function() {
    return this.get('hasModel') && this.get('model.value.model.type') === 'type-ember-object';
  }),

  labelStyle: computed('model.parentCount', function() {
    return htmlSafe(`padding-left: ${+this.get('model.parentCount') * 20 + 5}px;`);
  }),

  /**
   * @method mouseEnter
   * @param {Object} e event object
   */
  mouseEnter(e) {
    this.sendAction('previewLayer', this.get('model'));
    e.stopPropagation();
  },

  /**
   * @method mouseLeave
   * @param {Object} e event object
   */
  mouseLeave(e) {
    this.sendAction('hidePreview', this.get('model'));
    e.stopPropagation();
  },

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
