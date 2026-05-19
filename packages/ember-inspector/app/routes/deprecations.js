import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import { setProperties } from '@ember/object';
import TabRoute from 'ember-inspector/routes/tab';

export default class DeprecationsRoute extends TabRoute {
  @service adapter;
  @service port;

  model() {
    return new Promise((resolve) => {
      this.port.one('deprecation:deprecationsAdded', resolve);
      this.port.send('deprecation:watch');
    });
  }

  setupController(controller, message) {
    super.setupController(...arguments);

    this.deprecationsAdded(message);
  }

  activate() {
    super.activate(...arguments);

    this.port.on('deprecation:deprecationsAdded', this, this.deprecationsAdded);
  }

  deactivate() {
    super.deactivate(...arguments);

    this.port.off(
      'deprecation:deprecationsAdded',
      this,
      this.deprecationsAdded,
    );
  }

  deprecationsAdded(message) {
    message.deprecations.forEach((item) => {
      let record = this.controller.deprecations.find(
        (deprecation) => deprecation.id === item.id,
      );

      if (record) {
        setProperties(record, item);
      } else {
        this.controller.deprecations.push(item);
      }
    });
  }
}
