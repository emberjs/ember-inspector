import { service } from 'ember-inspector/utils/service';
import Route from '@ember/routing/route';

export default class InfoIndexRoute extends Route {
  @service router;

  beforeModel() {
    this.router.transitionTo('libraries');
  }
}
