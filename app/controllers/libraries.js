import { computed } from '@ember/object';
import Controller from '@ember/controller';

export default class LibrariesController extends Controller {
  @computed('model.[]')
  get rows() {
    return this.model.map(({ name, version }) => ({
      library: name,
      version,
    }));
  }
}
