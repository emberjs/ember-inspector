import type Controller from '@ember/controller';
import type Transition from '@ember/routing/transition';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';

import { TrackedArray } from 'tracked-built-ins';

import type PortService from '../services/port';
import type { Message, ModelType, RecordType } from '../services/port';
import TabRoute from '../routes/tab';
// @ts-expect-error TODO: not yet typed
import type RecordsController from '../controllers/records';

export default class RecordsRoute extends TabRoute {
  @service declare port: PortService;

  declare controller: RecordsController;

  model() {
    return new TrackedArray([]);
  }

  setupController(
    controller: Controller,
    model: unknown,
    transition: Transition,
  ) {
    super.setupController(controller, model, transition);

    const type = this.modelFor('model_type') as ModelType;

    controller.set('modelType', type);

    this.port.on('data:recordsAdded', this, this.addRecords);
    this.port.on('data:recordsUpdated', this, this.updateRecords);
    this.port.on('data:recordsRemoved', this, this.removeRecords);
    this.port.one('data:filters', this, (message: Message) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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

  get _currentModel(): Array<RecordType> {
    return this.modelFor(this.routeName) as Array<RecordType>;
  }

  addRecords = (message: Message) => {
    this._currentModel.push(...message.records);
  };

  removeRecords = (message: Message) => {
    this._currentModel.splice(message.index, message.count);
  };

  updateRecords = (message: Message) => {
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
