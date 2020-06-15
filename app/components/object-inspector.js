import Component from '@ember/component';
import { action, computed, get } from '@ember/object';

export default Component.extend({
  tagName: '',

  propDisplayType: 'grouped',
  customFilter: '',

  init() {
    this._super(...arguments);
    this.searchInputId = 'custom-filter-input';
  },

  trail: computed('model.[]', function () {
    let nested = this.model.slice(1);
    if (nested.length === 0) {
      return '';
    }
    return `.${nested.mapBy('property').join('.')}`;
  }),

  isNested: computed.gt('model.length', 1),

  setPropDisplay: action(function (type) {
    // The custom filter is only working for the "all" table yet
    // Otherwise, we reset the customFilter input value
    if (type !== 'all') {
      this.set('customFilter', '');
    }

    this.set('propDisplayType', type);
  }),

  setCustomFilter: action(function (event) {
    let { value } = event.target;
    this.setProperties({
      propDisplayType: 'all',
      customFilter: value,
    });
  }),

  clearCustomFilter: action(function () {
    document.querySelector('#' + this.searchInputId).focus();
    this.set('customFilter', '');
  }),

  sendObjectToConsole: action(function (obj) {
    let objectId = get(obj, 'objectId');
    this.port.send('objectInspector:sendToConsole', {
      objectId,
    });
  }),

  popStack: action(function () {
    if (this.isNested) {
      this.popMixinDetails();
    }
  }),

  traceErrors: action(function (objectId) {
    this.port.send('objectInspector:traceErrors', {
      objectId,
    });
  }),
});
