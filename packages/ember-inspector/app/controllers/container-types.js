import { service } from '@ember/service';
import Controller from '@ember/controller';
import { compare } from '@ember/utils';

export default class ContainerTypesController extends Controller {
  @service router;

  get sorted() {
    return this.model.slice().sort((a, b) => compare(a.name, b.name));
  }
}
