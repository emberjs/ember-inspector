import { computed } from '@ember/object';
import Controller from '@ember/controller';

export default Controller.extend({
  rows: computed('model.[]', function () {
    return this.get('model.[]').map(({ name, version }) => ({
      library: name,
      version,
    }));
  }),
});
