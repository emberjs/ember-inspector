import Controller from '@ember/controller';
import { sort } from '@ember/object/computed';

export default Controller.extend({
  sorted: sort('model', 'sortProperties'),

  init() {
    this._super(...arguments);

    this.sortProperties = ['name'];
  }
});
