import { set } from '@ember/object';
import TabRoute from 'ember-inspector/routes/tab';

export default TabRoute.extend({
  setupController(controller, model) {
    this._super(controller, model);

    const type = this.modelFor('model_type');

    controller.set('modelType', type);

    this.port.on('data:recordsAdded', this, this.addRecords);
    this.port.on('data:recordsUpdated', this, this.updateRecords);
    this.port.on('data:recordsRemoved', this, this.removeRecords);
    this.port.one('data:filters', this, function (message) {
      this.set('controller.filters', message.filters);
    });
    this.port.send('data:getFilters');
    this.port.send('data:getRecords', { objectId: type.objectId });
  },

  model() {
    return [];
  },

  deactivate() {
    this.port.off('data:recordsAdded', this, this.addRecords);
    this.port.off('data:recordsUpdated', this, this.updateRecords);
    this.port.off('data:recordsRemoved', this, this.removeRecords);
    this.port.send('data:releaseRecords');
  },

  updateRecords(message) {
    message.records.forEach((record) => {
      let currentRecord = this.currentModel.findBy('objectId', record.objectId);
      if (currentRecord) {
        set(currentRecord, 'columnValues', record.columnValues);
        set(currentRecord, 'filterValues', record.filterValues);
        set(currentRecord, 'searchIndex', record.searchIndex);
        set(currentRecord, 'color', record.color);
      }
    });
  },

  addRecords(message) {
    this.currentModel.pushObjects(message.records);
  },

  removeRecords(message) {
    this.currentModel.removeAt(message.index, message.count);
  },
});
