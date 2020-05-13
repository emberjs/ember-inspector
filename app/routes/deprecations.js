import { Promise } from 'rsvp';
import { setProperties } from '@ember/object';
import TabRoute from 'ember-inspector/routes/tab';

export default TabRoute.extend({
  model() {
    return new Promise((resolve) => {
      this.port.one('deprecation:deprecationsAdded', resolve);
      this.port.send('deprecation:watch');
    });
  },

  setupController(controller, message) {
    this._super(...arguments);
    this.deprecationsAdded(message);
  },

  activate() {
    this._super(...arguments);
    this.port.on('deprecation:deprecationsAdded', this, this.deprecationsAdded);
  },

  deactivate() {
    this._super(...arguments);
    this.port.off(
      'deprecation:deprecationsAdded',
      this,
      this.deprecationsAdded
    );
  },

  deprecationsAdded(message) {
    let { deprecations } = this.controller;

    message.deprecations.forEach((item) => {
      let record = deprecations.findBy('id', item.id);
      if (record) {
        setProperties(record, item);
      } else {
        deprecations.pushObject(item);
      }
    });
  },

  actions: {
    clear() {
      this.port.send('deprecation:clear');
      this.currentModel.clear();
    },
  },
});
