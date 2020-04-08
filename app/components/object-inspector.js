import Component from '@ember/component';
import { action, computed, get } from '@ember/object';

export default Component.extend({
  tagName: '',

  propDisplayType: 'grouped',
  customFilter: '',

  trail: computed('model.[]', function () {
    let nested = this.model.slice(1);
    if (nested.length === 0) { return ""; }
    return `.${nested.mapBy('property').join(".")}`;
  }),

  isNested: computed('model.[]', function () {
    return this.get('model.length') > 1;
  }),

  setPropDisplay: action(function (type) {
    this.set('propDisplayType', type);
  }),

  setCustomFilter: action(function (event) {
    let { value } = event.target;
    this.set('customFilter', value);
  }),

  clearCustomFilter: action(function () {
    this.set('customFilter', '');
  }),

  sendObjectToConsole: action(function (obj) {
    let objectId = get(obj, 'objectId');
    this.port.send('objectInspector:sendToConsole', {
      objectId
    });
  }),

  popStack: action(function () {
    if (this.isNested) {
      this.popMixinDetails();
    }
  }),

  traceErrors: action(function(objectId) {
    this.port.send('objectInspector:traceErrors', {
      objectId
    });
  })
});

