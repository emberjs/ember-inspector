import { computed } from '@ember/object';
import Component from '@ember/component';
export default Component.extend({
  filterValue: null,
  checked: computed('filterValue', 'model.name', function() {
    return this.filterValue === this.get('model.name');
  })
});
