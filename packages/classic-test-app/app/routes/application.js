import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service store;

  /**
   * Records for the Data tab of the inspector.
   */
  model() {
    return this.store.push({
      data: [
        { type: 'post', id: '1', attributes: { title: 'First post' } },
        { type: 'post', id: '2', attributes: { title: 'Second post' } },
      ],
    });
  }
}
