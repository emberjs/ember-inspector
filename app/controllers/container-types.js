import Controller, { inject as controller } from '@ember/controller';
import { sort } from '@ember/object/computed';

export default Controller.extend({
  application: controller(),

  sortProperties: ['name'],
  sorted: sort('model', 'sortProperties')
});
