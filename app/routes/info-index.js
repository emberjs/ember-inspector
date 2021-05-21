import Route from '@ember/routing/route';

export default class InfoIndexRoute extends Route {
  beforeModel() {
    this.transitionTo('libraries');
  }
}
