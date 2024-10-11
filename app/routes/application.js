import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';
import Route from '@ember/routing/route';
import Ember from 'ember';
const { NativeArray } = Ember;

export default class ApplicationRoute extends Route {
  @service adapter;
  @service port;
  @service router;

  setupController(controller) {
    controller.set('mixinStack', []);
    let port = this.port;
    port.on('objectInspector:updateObject', this, this.updateObject);
    port.on('objectInspector:updateProperty', this, this.updateProperty);
    port.on('objectInspector:updateErrors', this, this.updateErrors);
    port.on('objectInspector:droppedObject', this, this.droppedObject);
    port.on('deprecation:count', this, this.setDeprecationCount);
    port.on('view:inspectComponent', this, this.inspectComponent);
    port.on('view:previewComponent', this, this.previewComponent);
  }

  deactivate() {
    let port = this.port;
    port.off('objectInspector:updateObject', this, this.updateObject);
    port.off('objectInspector:updateProperty', this, this.updateProperty);
    port.off('objectInspector:updateErrors', this, this.updateErrors);
    port.off('objectInspector:droppedObject', this, this.droppedObject);
    port.off('deprecation:count', this, this.setDeprecationCount);
    port.off('view:inspectComponent', this, this.inspectComponent);
    port.off('view:previewComponent', this, this.previewComponent);
  }

  inspectComponent({ id }) {
    this.router.transitionTo('component-tree', {
      queryParams: {
        pinned: id,
      },
    });
  }

  previewComponent({ id }) {
    this.router.transitionTo('component-tree', {
      queryParams: {
        previewing: id,
      },
    });
  }

  updateObject(options) {
    let { details, errors, name, objectId, property } = options;

    NativeArray.apply(details);
    details.forEach(arrayize);

    // eslint-disable-next-line ember/no-controller-access-in-routes
    let controller = this.controller;

    if (options.parentObject) {
      controller.pushMixinDetails(name, property, objectId, details, errors);
    } else {
      controller.activateMixinDetails(name, objectId, details, errors);
    }

    // eslint-disable-next-line ember/no-controller-access-in-routes
    this.controller.showInspector();
  }

  setDeprecationCount(message) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    this.controller.set('deprecationCount', message.count);
  }

  // eslint-enable ember/no-controller-access-in-routes

  updateProperty(options) {
    if (this.get('controller.mixinDetails.mixins')) {
      const detail = this.get('controller.mixinDetails.mixins').objectAt(
        options.mixinIndex,
      );
      let property = detail.properties.findBy('name', options.property);
      if (!property) return;
      set(property, 'value', options.value);
      if (options.dependentKeys) {
        set(property, 'dependentKeys', options.dependentKeys);
      }
    }
  }

  updateErrors(options) {
    let mixinDetails = this.get('controller.mixinDetails');
    if (mixinDetails) {
      if (mixinDetails.objectId === options.objectId) {
        set(mixinDetails, 'errors', options.errors);
      }
    }
  }

  droppedObject(message) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    this.controller.droppedObject(message.objectId);
  }

  @action
  inspectObject(objectId) {
    if (objectId) {
      this.port.send('objectInspector:inspectById', { objectId });
    }
  }
}

function arrayize(mixin) {
  NativeArray.apply(mixin.properties);
}
