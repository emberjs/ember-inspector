import TextField from '@ember/component/text-field';
export default TextField.extend({
  attributeBindings: ['label:data-label'],

  /**
   * The property-component instance.
   * Passed through the template.
   *
   * @property propertyComponent
   * @type {Ember.Component}
   */
  propertyComponent: null,

  didInsertElement() {
    this.element.select();
    return this._super(...arguments);
  },

  insertNewline() {
    this.propertyComponent.send(this['save-property']);
    this.propertyComponent.send(this['finished-editing']);
  },

  cancel() {
    this.propertyComponent.send(this['finished-editing']);
  },

  focusOut() {
    this.propertyComponent.send(this['finished-editing']);
  }
});
