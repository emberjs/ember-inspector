import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: '',
  typeClass: computed('type', function() {
    return `js-${this.get('type')}-type`;
  })
});
