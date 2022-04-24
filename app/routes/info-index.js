import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class InfoIndexRoute extends Route {
  @service router;

  beforeModel() {
    this.router.transitionTo('libraries');
  }
}
