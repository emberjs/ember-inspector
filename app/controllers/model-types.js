import Ember from "ember";
const { Controller, computed: { sort, filter }, get } = Ember;

export default Controller.extend({
  navWidth: 180,
  sortProperties: ['name'],
  options: {
    hideEmptyModelTypes: false
  },

  sorted: sort('filtered', 'sortProperties'),

  filtered: filter('model', function(typeItem) {
    let hideEmptyModels = get(this, 'options.hideEmptyModelTypes');

    if (hideEmptyModels) {
      return !!get(typeItem, 'count');
    } else {
      return true;
    }
  }).property('model', 'options.hideEmptyModelTypes')
});
