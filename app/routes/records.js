import { inject as service } from '@ember/service';
import { set } from '@ember/object';
import TabRoute from 'ember-inspector/routes/tab';

export default class RecordsRoute extends TabRoute {
  @service port;

  model() {
    return [];
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    const type = this.modelFor('model_type');

    controller.set('modelType', type);

    this.port.on('data:recordsAdded', this, this.addRecords);
    this.port.on('data:recordsUpdated', this, this.updateRecords);
    this.port.on('data:recordsRemoved', this, this.removeRecords);
    this.port.one('data:filters', this, function (message) {
      set(this, 'controller.filters', message.filters);
    });
    this.port.send('data:getFilters');
    this.port.send('data:getRecords', { objectId: type.objectId });
  }

  deactivate() {
    this.port.off('data:recordsAdded', this, this.addRecords);
    this.port.off('data:recordsUpdated', this, this.updateRecords);
    this.port.off('data:recordsRemoved', this, this.removeRecords);
    this.port.send('data:releaseRecords');
  }

  addRecords(message) {
    this.currentModel.pushObjects(message.records);
  }

  removeRecords(message) {
    this.currentModel.removeAt(message.index, message.count);
  }

  updateRecords(message) {
    message.records.forEach((record) => {
      let currentRecord = this.currentModel.find(
        (x) => x.objectId === record.objectId,
      );
      if (currentRecord) {
        set(currentRecord, 'columnValues', record.columnValues);
        set(currentRecord, 'filterValues', record.filterValues);
        set(currentRecord, 'searchIndex', record.searchIndex);
        set(currentRecord, 'color', record.color);
      }
    });
  }
}
