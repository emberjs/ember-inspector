import Component from '@ember/component';
import { notEmpty } from '@ember/object/computed';

export default Component.extend({
  isExpanded: false,

  tagName: '',

  hasMap: notEmpty('model.hasSourceMap'),

  actions: {
    toggleExpand() {
      this.toggleProperty('isExpanded');
    }
  }
});
