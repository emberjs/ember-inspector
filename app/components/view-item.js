import { computed } from '@ember/object';
import Component from '@ember/component';
import { htmlSafe } from '@ember/string';
import { not, bool, equal } from '@ember/object/computed';

export default Component.extend({
  /**
   * No tag. This component should not affect
   * the DOM.
   *
   * @property tagName
   * @type {String}
   * @default ''
   */
  tagName: '',

  /**
   * Has a view (component) instance.
   *
   * @property hasView
   * @type {Boolean}
   */
  hasView: bool('model.value.viewClass'),

  /**
   * Whether it has a tag or not.
   *
   * @property isTagless
   * @type {Boolean}
   */
  isTagless: equal('model.value.tagName', ''),

  /**
   * Whether it has an element or not (depends on the tagName).
   *
   * @property hasElement
   * @type {Boolean}
   */
  hasElement: not('isTagless'),

  /**
   * Whether it has a layout/template or not.
   *
   * @property hasTemplate
   * @type {Boolean}
   */
  hasTemplate: bool('model.value.template'),

  hasModel: bool('model.value.model'),

  hasController: bool('model.value.controller'),

  modelInspectable: computed('hasModel', 'model.value.model.type', function() {
    return this.get('hasModel') && this.get('model.value.model.type') === 'type-ember-object';
  }),

  labelStyle: computed('model.parentCount', function() {
    return htmlSafe(`padding-left: ${+this.get('model.parentCount') * 20 + 5}px;`);
  }),

  actions: {
    inspectView() {
      if (this.get('hasView')) {
        this.inspect(this.get('model.value.objectId'));
      }
    },
    inspectElement(objectId) {
      let elementId;
      if (!objectId && this.get('hasElement')) {
        objectId = this.get('model.value.objectId');
      }
      if (!objectId) {
        elementId = this.get('model.value.elementId');
      }
      if (objectId || elementId) {
        this.inspectElement({ objectId, elementId });
      }
    },
    inspectModel(objectId) {
      if (this.get('modelInspectable')) {
        this.inspect(objectId);
      }
    }
  }
});
