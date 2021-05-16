import Route from '@ember/routing/route';
import { Promise } from 'rsvp';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';

/**
 * @module ember-inspector/routes/app-detected
 */
export default Route.extend({
  port: service(),

  /**
   * Sends a request to ember-debug to figure out whether
   * the ember-app has booted so that we can start inspecting!
   *
   * @return {Promise}
   */
  model() {
    let port = this.port;

    return new Promise((resolve) => {
      this.applicationBooted = ({ booted }) => {
        if (booted) {
          port.off('general:applicationBooted', this.applicationBooted);
          this.applicationBooted = null;
          resolve();
        }
      };
      port.on('general:applicationBooted', this.applicationBooted);
      port.send('general:applicationBooted');
    });
  },

  afterModel() {
    this.port.send('deprecation:getCount');
  },

  /**
   * Sets up a listener such that if ember-debug resets, the inspector app also
   * resets.
   */
  setupController() {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    this.controllerFor('application').set('isEmberApplication', true);
    this.port.one('general:reset', this, this.reset);
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
    // We wrapped this in an if because deactivate is being called before this.applicationBooted is defined in the model hook
    if (this.applicationBooted) {
      this.port.off('general:applicationBooted', this.applicationBooted);
    }

    this.port.off('general:reset', this, this.reset);
  },
});
