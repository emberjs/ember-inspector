/* eslint no-empty:0 */
import Route from '@ember/routing/route';
export default Route.extend({
  renderTemplate() {
    this.render();
    try {
      this.render(`${this.routeName.replace(/\./g, '/')}-toolbar`, {
        into: 'application',
        outlet: 'toolbar'
      });
    } catch (e) {}
  }
});
