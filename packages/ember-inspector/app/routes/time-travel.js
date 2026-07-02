import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import TabRoute from 'ember-inspector/routes/tab';

export default class TimeTravelRoute extends TabRoute {
  @service port;

  model() {
    return new Promise((resolve) => {
      this.port.one('timeTravel:state', resolve);
      this.port.send('timeTravel:checkState');
    });
  }

  setupController(controller, message) {
    super.setupController(...arguments);

    controller.updateState(message);
  }

  activate() {
    super.activate(...arguments);

    this.port.on('timeTravel:state', this, this.stateUpdated);
  }

  deactivate() {
    super.deactivate(...arguments);

    this.port.off('timeTravel:state', this, this.stateUpdated);
  }

  stateUpdated(message) {
    this.controller.updateState(message);
  }
}
