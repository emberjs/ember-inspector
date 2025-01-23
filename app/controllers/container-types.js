// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class ContainerTypesController extends Controller {
  @service router;

  sortProperties = ['name'];

  @sort('model', 'sortProperties') sorted;
}
