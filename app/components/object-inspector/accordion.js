import { action, computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  tagName: '',

  isExpanded: computed('mixin.expand', 'mixin.properties.length', function () {
    return this.get('mixin.expand') && this.get('mixin.properties.length') > 0;
  }),

  toggle: action(function () {
    this.toggleProperty('mixin.expand');
  }),
});

