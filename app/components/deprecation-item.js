import Component from '@ember/component';
import { notEmpty } from '@ember/object/computed';

export default Component.extend({
  isExpanded: true,

  tagName: '',

  hasMap: notEmpty('model.hasSourceMap'),

  actions: {
    toggleExpand() {
      this.toggleProperty('isExpanded');
    }
  }
});
