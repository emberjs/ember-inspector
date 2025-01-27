import type Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';
import type Transition from '@ember/routing/transition';

import { TrackedArray } from 'tracked-built-ins';

import type PortService from '../services/port';
import TabRoute from '../routes/tab';
import type { Message, ModelType } from '../services/port';

export default class ModelTypesRoute extends TabRoute {
  @service declare port: PortService;

  model() {
    return new Promise<TrackedArray<ModelType>>((resolve) => {
      this.port.one('data:modelTypesAdded', function (message: Message) {
        resolve(new TrackedArray(message.modelTypes));
      });
      this.port.send('data:getModelTypes');
    });
  }

  setupController(
    controller: Controller,
    model: unknown,
    transition: Transition,
  ) {
    super.setupController(controller, model, transition);

    this.port.on('data:modelTypesAdded', this, this.addModelTypes);
    this.port.on('data:modelTypesUpdated', this, this.updateModelTypes);
  }

  deactivate() {
    this.port.off('data:modelTypesAdded', this, this.addModelTypes);
    this.port.off('data:modelTypesUpdated', this, this.updateModelTypes);
    this.port.send('data:releaseModelTypes');
  }

  get _currentModel(): Array<ModelType> {
    return this.modelFor(this.routeName) as Array<ModelType>;
  }

  addModelTypes = (message: Message) => {
    this._currentModel.push(...message.modelTypes);
  };

  updateModelTypes = (message: Message) => {
    message.modelTypes.forEach((modelType) => {
      const currentType = this._currentModel.find(
        (x) => x.objectId === modelType.objectId,
      );
      set(currentType as ModelType, 'count', modelType.count);
    });
  };
}
