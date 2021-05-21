import { sort } from '@ember/object/computed';
import Controller from '@ember/controller';

export default class ContainerTypesController extends Controller {
  @sort('model', 'sortProperties') sorted;

  constructor() {
    super(...arguments);

    this.sortProperties = ['name'];
  }
}
