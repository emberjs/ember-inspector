import classic from 'ember-classic-decorator';
/* eslint no-empty:0 */
import Route from '@ember/routing/route';
@classic
export default class TabRoute extends Route {
  renderTemplate() {
    this.render();
    try {
      this.render(`${this.routeName.replace(/\./g, '/')}-toolbar`, {
        into: 'application',
        outlet: 'toolbar',
      });
    } catch (e) {}
  }
}
