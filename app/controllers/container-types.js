import { sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class ContainerTypesController extends Controller {
  @service router;

  @sort('model', 'sortProperties') sorted;

  constructor() {
    super(...arguments);

    this.sortProperties = ['name'];
  }
}
