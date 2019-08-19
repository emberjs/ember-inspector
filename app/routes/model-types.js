import { set } from '@ember/object';
import { Promise } from 'rsvp';
import TabRoute from "ember-inspector/routes/tab";

export default TabRoute.extend({
  setupController(controller, model) {
    this._super(controller, model);
    this.port.on('data:modelTypesAdded', this, this.addModelTypes);
    this.port.on('data:modelTypesUpdated', this, this.updateModelTypes);
  },

  model() {
    const port = this.port;
    return new Promise(function(resolve) {
      port.one('data:modelTypesAdded', function(message) {
        resolve(message.modelTypes);
      });
      port.send('data:getModelTypes');
    });
  },

  deactivate() {
    this.port.off('data:modelTypesAdded', this, this.addModelTypes);
    this.port.off('data:modelTypesUpdated', this, this.updateModelTypes);
    this.port.send('data:releaseModelTypes');
  },

  addModelTypes(message) {
    this.currentModel.pushObjects(message.modelTypes);
  },

  updateModelTypes(message) {
    let route = this;
    message.modelTypes.forEach(function(modelType) {
      const currentType = route.currentModel.findBy('objectId', modelType.objectId);
      set(currentType, 'count', modelType.count);
    });
  },

  actions: {
    reload() {
      this.refresh();
    }
  }
});
