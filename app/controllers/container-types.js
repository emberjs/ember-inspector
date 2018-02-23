import Controller from '@ember/controller';
import { sort } from '@ember/object/computed';

export default Controller.extend({
  sortProperties: ['name'],
  sorted: sort('model', 'sortProperties')
});
