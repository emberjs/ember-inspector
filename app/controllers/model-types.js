import Ember from 'ember';
import LocalStorageService from 'ember-inspector/services/storage/local';
const { Controller, computed, get, inject } = Ember;
const { sort } = computed;
const { controller, service } = inject;

export default Controller.extend({
  application: controller(),
  navWidth: 180,
  sortProperties: ['name'],
  storage: service(`storage/${LocalStorageService.SUPPORTED ? 'local' : 'memory'}`),
  hideEmptyModelTypes: computed({
    get() {
      return !!this.get('storage').getItem('are-model-types-hidden');
    },
    set(key, value) {
      if (!value) {
        this.get('storage').removeItem('are-model-types-hidden');
      } else {
        this.get('storage').setItem('are-model-types-hidden', value);
      }
      return value;
    }
  }),

  sorted: sort('filtered', 'sortProperties'),

  filtered: computed('model.@each.count', 'hideEmptyModelTypes', function() {
    return this.get('model').filter(item => {
      let hideEmptyModels = get(this, 'hideEmptyModelTypes');

      if (hideEmptyModels) {
        return !!get(item, 'count');
      } else {
        return true;
      }
    });
  })
});
