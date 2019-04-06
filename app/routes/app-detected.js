import Route from '@ember/routing/route';
import { Promise } from 'rsvp';
import { getOwner } from '@ember/application';

/**
 * @module ember-inspector/routes/app-detected
 */
export default Route.extend({
  /**
   * Sends a request to ember-debug to figure out whether
   * the ember-app has booted so that we can start inspecting!
   *
   * @return {Promise}
   */
  model() {
    let port = this.get('port');
    return new Promise(resolve => {
      port.on('general:applicationBooted', function applicationBooted({ booted }) {
        if (booted) {
          port.off('general:applicationBooted', applicationBooted);
          resolve();
        }
      });
      port.send('general:applicationBooted');
    });
  },

  /**
   * Sets up a listener such that if ember-debug resets, the inspector app also
   * resets.
   */
  setupController() {
    this.controllerFor('application').set('isEmberApplication', true);
    this.get('port').one('general:reset', this, this.reset);
  },

  /**
   * Resets the application.
   */
  reset() {
    getOwner(this).lookup('application:main').reset();
  },

  /**
   * Makes sure the listeners are turned off.
   */
  deactivate() {
    this.get('port').off('general:applicationBooted');
    this.get('port').off('general:reset', this, this.reset);
  }
});
