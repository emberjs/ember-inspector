import { inject as service } from '@ember/service';
import { set } from '@ember/object';

import { TrackedArray } from 'tracked-built-ins';

import TabRoute from '../routes/tab';

export default class RecordsRoute extends TabRoute {
  @service port;

  model() {
    return new TrackedArray([]);
  }

  setupController(controller, model, transition) {
    super.setupController(controller, model, transition);

    const type = this.modelFor('model_type');

    controller.modelType = type;

    this.port.on('data:recordsAdded', this, this.addRecords);
    this.port.on('data:recordsUpdated', this, this.updateRecords);
    this.port.on('data:recordsRemoved', this, this.removeRecords);
    this.port.one('data:filters', this, (message) => {
      this.controller.filters = new TrackedArray(message.filters);
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

  get _currentModel() {
    return this.modelFor(this.routeName);
  }

  addRecords = (message) => {
    this._currentModel.push(...message.records);
  };

  removeRecords = (message) => {
    this._currentModel.splice(message.index, message.count);
  };

  updateRecords = (message) => {
    message.records.forEach((record) => {
      const currentRecord = this._currentModel.find(
        (x) => x.objectId === record.objectId,
      );
      if (currentRecord) {
        set(currentRecord, 'columnValues', record.columnValues);
        set(currentRecord, 'filterValues', record.filterValues);
        set(currentRecord, 'searchIndex', record.searchIndex);
        set(currentRecord, 'color', record.color);
      }
    });
  };
}
