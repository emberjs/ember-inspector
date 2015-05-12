import Ember from "ember";
const { Controller, computed: { sort } } = Ember;

export default Controller.extend({
  navWidth: 180,
  sortProperties: ['name'],

  sorted: sort('model', 'sortProperties')
});
