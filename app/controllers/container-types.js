import Controller, { inject as controller } from '@ember/controller';
import { sort } from '@ember/object/computed';

export default Controller.extend({
  application: controller(),

  sorted: sort('model', 'sortProperties'),

  init() {
    this._super(...arguments);

    this.sortProperties = ['name'];
  }
});
