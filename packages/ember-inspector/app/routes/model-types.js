import { inject as service } from '@ember/service';
import { set } from '@ember/object';

import { TrackedArray } from 'tracked-built-ins';

import TabRoute from '../routes/tab';

export default class ModelTypesRoute extends TabRoute {
  @service port;

  model() {
    return new Promise((resolve) => {
      this.port.one('data:modelTypesAdded', function (message) {
        resolve(new TrackedArray(message.modelTypes));
      });
      this.port.send('data:getModelTypes');
    });
  }

  setupController(controller, model, transition) {
    super.setupController(controller, model, transition);

    this.port.on('data:modelTypesAdded', this, this.addModelTypes);
    this.port.on('data:modelTypesUpdated', this, this.updateModelTypes);
  }

  deactivate() {
    this.port.off('data:modelTypesAdded', this, this.addModelTypes);
    this.port.off('data:modelTypesUpdated', this, this.updateModelTypes);
    this.port.send('data:releaseModelTypes');
  }

  get _currentModel() {
    return this.modelFor(this.routeName);
  }

  addModelTypes = (message) => {
    this._currentModel.push(...message.modelTypes);
  };

  updateModelTypes = (message) => {
    message.modelTypes.forEach((modelType) => {
      const currentType = this._currentModel.find(
        (x) => x.objectId === modelType.objectId,
      );
      set(currentType, 'count', modelType.count);
    });
  };
}
