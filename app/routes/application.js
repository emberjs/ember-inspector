import Ember from "ember";
const { Route } = Ember;
const set = Ember.set;

export default Route.extend({

  setupController() {
    this.controllerFor('mixinStack').set('model', []);
    let port = this.get('port');
    port.on('objectInspector:updateObject', this, this.updateObject);
    port.on('objectInspector:updateProperty', this, this.updateProperty);
    port.on('objectInspector:updateErrors', this, this.updateErrors);
    port.on('objectInspector:droppedObject', this, this.droppedObject);
    port.on('deprecation:count', this, this.setDeprecationCount);
    port.send('deprecation:getCount');
  },

  deactivate() {
    let port = this.get('port');
    port.off('objectInspector:updateObject', this, this.updateObject);
    port.off('objectInspector:updateProperty', this, this.updateProperty);
    port.off('objectInspector:updateErrors', this, this.updateErrors);
    port.off('objectInspector:droppedObject', this, this.droppedObject);
    port.off('deprecation:count', this, this.setDeprecationCount);
  },

  updateObject(options) {
    const details = options.details,
      name = options.name,
      property = options.property,
      objectId = options.objectId,
      errors = options.errors;

    Ember.NativeArray.apply(details);
    details.forEach(arrayize);

    let controller = this.get('controller');

    if (options.parentObject) {
      controller.pushMixinDetails(name, property, objectId, details);
    } else {
      controller.activateMixinDetails(name, objectId, details, errors);
    }

    this.send('expandInspector');
  },

  setDeprecationCount(message) {
    this.controller.set('deprecationCount', message.count);
  },

  updateProperty(options) {
    const detail = this.controllerFor('mixinDetails').get('model.mixins').objectAt(options.mixinIndex);
    const property = Ember.get(detail, 'properties').findProperty('name', options.property);
    set(property, 'value', options.value);
  },

  updateErrors(options) {
    const mixinDetails = this.controllerFor('mixinDetails');
    if (mixinDetails.get('model.objectId') === options.objectId) {
      mixinDetails.set('model.errors', options.errors);
    }
  },

  droppedObject(message) {
    let controller = this.get('controller');
    controller.droppedObject(message.objectId);
  },

  actions: {
    expandInspector() {
      this.set("controller.inspectorExpanded", true);
    },
    toggleInspector() {
      this.toggleProperty("controller.inspectorExpanded");
    },
    inspectObject(objectId) {
      if (objectId) {
        this.get('port').send('objectInspector:inspectById', { objectId: objectId });
      }
    },
    setIsDragging(isDragging) {
      this.set('controller.isDragging', isDragging);
    },
    refreshPage() {
      // If the adapter defined a `reloadTab` method, it means
      // they prefer to handle the reload themselves
      if (typeof this.get('adapter').reloadTab === 'function') {
        this.get('adapter').reloadTab();
      } else {
        // inject ember_debug as quickly as possible in chrome
        // so that promises created on dom ready are caught
        this.get('port').send('general:refresh');
        this.get('adapter').willReload();
      }
    }
  }
});

function arrayize(mixin) {
  Ember.NativeArray.apply(mixin.properties);
}
