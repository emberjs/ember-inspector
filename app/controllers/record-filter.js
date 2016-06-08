import Ember from "ember";
const { inject, computed } = Ember;
export default Ember.Controller.extend({
  records: inject.controller(),

  checked: computed('records.filterValue', function() {
    return this.get('records.filterValue') === this.get('name');
  })
});
