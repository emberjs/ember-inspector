import Ember from "ember";
export default Ember.Route.extend({

  setupController: function() {
    this.controllerFor('mixinStack').set('model', []);
    var port = this.get('port');
    port.on('objectInspector:updateObject', this, this.updateObject);
    port.on('objectInspector:updateProperty', this, this.updateProperty);
    port.on('objectInspector:droppedObject', this, this.droppedObject);
    port.on('deprecation:count', this, this.setDeprecationCount);
    port.send('deprecation:getCount');
  },

  deactivate: function() {
    var port = this.get('port');
    port.off('objectInspector:updateObject', this, this.updateObject);
    port.off('objectInspector:updateProperty', this, this.updateProperty);
    port.off('objectInspector:droppedObject', this, this.droppedObject);
    port.off('deprecation:count', this, this.setDeprecationCount);
  },

  updateObject: function(options) {
    var details = options.details,
      name = options.name,
      property = options.property,
      objectId = options.objectId;

    Ember.NativeArray.apply(details);
    details.forEach(arrayize);

    var controller = this.get('controller');

    if (options.parentObject) {
      controller.pushMixinDetails(name, property, objectId, details);
    } else {
      controller.activateMixinDetails(name, details, objectId);
    }

    this.send('expandInspector');
  },

  setDeprecationCount: function(message) {
    this.controller.set('deprecationCount', message.count);
  },

  updateProperty: function(options) {
    var detail = this.controllerFor('mixinDetails').get('mixins').objectAt(options.mixinIndex);
    var property = Ember.get(detail, 'properties').findProperty('name', options.property);
    Ember.set(property, 'value', options.value);
  },

  droppedObject: function(message) {
    var controller = this.get('controller');
    controller.droppedObject(message.objectId);
  },

  actions: {
    expandInspector: function() {
      this.set("controller.inspectorExpanded", true);
    },
    toggleInspector: function() {
      this.toggleProperty("controller.inspectorExpanded");
    },
    inspectObject: function(objectId) {
      if (objectId) {
        this.get('port').send('objectInspector:inspectById', { objectId: objectId });
      }
    },
    setIsDragging: function (isDragging) {
      this.set('controller.isDragging', isDragging);
    },
    refreshPage: function() {
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
