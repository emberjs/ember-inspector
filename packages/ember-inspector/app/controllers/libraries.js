import Controller from '@ember/controller';

export default class LibrariesController extends Controller {
  get rows() {
    return this.model.map(({ name, version }) => ({
      library: name,
      version,
    }));
  }
}
