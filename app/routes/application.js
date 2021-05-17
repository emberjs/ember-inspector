import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import { set, get, action } from '@ember/object';
import Route from '@ember/routing/route';
import Ember from 'ember';

const { NativeArray } = Ember;

@classic
export default class ApplicationRoute extends Route {
  /**
   * Service used to broadcast changes to the application's layout
   * such as toggling of the object inspector.
   *
   * @property layoutService
   * @type {Service}
   */
  @service('layout') layoutService;
  @service port;

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
    this.transitionTo('component-tree', {
      queryParams: {
        pinned: id,
      },
    });
  }

  previewComponent({ id }) {
    this.transitionTo('component-tree', {
      queryParams: {
        previewing: id,
      },
    });
  }

  updateObject(options) {
    const details = options.details,
      name = options.name,
      property = options.property,
      objectId = options.objectId,
      errors = options.errors;

    NativeArray.apply(details);
    details.forEach(arrayize);

    // eslint-disable-next-line ember/no-controller-access-in-routes
    let controller = this.controller;

    if (options.parentObject) {
      controller.pushMixinDetails(name, property, objectId, details);
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
        options.mixinIndex
      );
      let property = get(detail, 'properties').findBy('name', options.property);
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
      if (get(mixinDetails, 'objectId') === options.objectId) {
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

  @action
  refreshPage() {
    // If the adapter defined a `reloadTab` method, it means
    // they prefer to handle the reload themselves
    if (typeof this.adapter.reloadTab === 'function') {
      this.adapter.reloadTab();
    } else {
      // inject ember_debug as quickly as possible in chrome
      // so that promises created on dom ready are caught
      this.port.send('general:refresh');
      this.adapter.willReload();
    }
  }
}

function arrayize(mixin) {
  NativeArray.apply(mixin.properties);
}
