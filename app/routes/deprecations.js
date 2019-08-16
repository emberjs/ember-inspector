import { set } from '@ember/object';
import TabRoute from "ember-inspector/routes/tab";

export default TabRoute.extend({
  setupController() {
    let port = this.port;
    port.on('deprecation:deprecationsAdded', this, this.deprecationsAdded);
    port.send('deprecation:watch');
    this._super(...arguments);
  },

  model() {
    return [];
  },

  deactivate() {
    this.port.off('deprecation:deprecationsAdded', this, this.deprecationsAdded);
  },

  deprecationsAdded(message) {
    let model = this.currentModel;
    message.deprecations.forEach(item => {
      let record = model.findBy('id', item.id);
      if (record) {
        set(record, 'count', item.count);
        set(record, 'sources', item.sources);
        set(record, 'url', item.url);
      } else {
        model.pushObject(item);
      }
    });
  },

  actions: {
    clear() {
      this.port.send('deprecation:clear');
      this.currentModel.clear();
    }

  }
});
