import Ember from "ember";
const { computed, Component } = Ember;
const { not, bool } = computed;

export default Component.extend({
  classNames: ['list-tree__item', 'row'],

  classNameBindings: ['isCurrent:row_highlight'],

  /**
   * Needed for tests
   *
   * @property attributeBindings
   * @type {Array}
   * @default ['data-label:label']
   */

  attributeBindings: ['data-label:label'],

  /**
   * @property label
   * @type {String}
   * @default 'tree-node'
   */
  label: 'tree-node',

  hasView: not('model.value.isVirtual'),
  hasElement: not('model.value.isVirtual'),
  hasModel: bool('model.value.model'),

  // passed as an attribute
  pinnedObjectId: null,

  isCurrent: computed('pinnedObjectId', 'model.value.objectId', function() {
    return this.get('pinnedObjectId') === this.get('model.value.objectId');
  }),

  hasController: bool('model.value.controller'),

  modelInspectable: computed('hasModel', 'model.value.model.type', function() {
    return this.get('hasModel') && this.get('model.value.model.type') === 'type-ember-object';
  }),

  labelStyle: computed('model.parentCount', function() {
    return Ember.String.htmlSafe(`padding-left: ${+this.get('model.parentCount') * 20 + 5}px;`);
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
  },

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
  }

});
