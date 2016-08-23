import Ember from "ember";
import RowEventsMixin from 'ember-inspector/mixins/row-events';
const { computed, Component, String: { htmlSafe } } = Ember;
const { not, bool } = computed;

export default Component.extend(RowEventsMixin, {
  /**
   * No tag. This component should not affect
   * the DOM.
   *
   * @property tagName
   * @type {String}
   * @default ''
   */
  tagName: '',

  hasView: not('model.value.isVirtual'),
  hasElement: not('model.value.isVirtual'),
  hasModel: bool('model.value.model'),

  hasController: bool('model.value.controller'),

  /**
   * The index of the current row. Currently used for the
   * `RowEvents` mixin. This property is passed through
   * the template.
   *
   * @property index
   * @type {Number}
   * @default null
   */
  index: null,

  modelInspectable: computed('hasModel', 'model.value.model.type', function() {
    return this.get('hasModel') && this.get('model.value.model.type') === 'type-ember-object';
  }),

  labelStyle: computed('model.parentCount', function() {
    return htmlSafe(`padding-left: ${+this.get('model.parentCount') * 20 + 5}px;`);
  }),

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
