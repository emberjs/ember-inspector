export default Ember.ObjectController.extend({
  needs: ['records'],

  checked: function() {
    return this.get('controllers.records.filterValue') === this.get('name');
  }.property('controllers.records.filterValue')
});
