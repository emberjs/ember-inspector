import { computed } from '@ember/object';
import Controller from '@ember/controller';

export default class LibrariesController extends Controller {
  @computed('model.[]')
  rows() {
    return this.get('model.[]').map(({ name, version }) => ({
      library: name,
      version,
    }));
  }
}
