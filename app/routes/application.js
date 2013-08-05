var ApplicationRoute = Ember.Route.extend({

  setupController: function(controller, model) {
    this.controllerFor('mixinStack').set('model', []);

    this.get('port').on('objectInspector:updateObject', this, this.updateObject);
    this.get('port').on('objectInspector:updateProperty', this, this.updateProperty);

    this.get('port').one('view:viewTree', this, function() {
      controller.set('emberApplication', true);
    });
    this._super(controller, model);
  },

  deactivate: function() {
    this.get('port').off('objectInspector:updateObject', this, this.updateObject);
    this.get('port').off('objectInspector:updateProperty', this, this.updateProperty);
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

  updateProperty: function(options) {
    var detail = this.controllerFor('mixinDetails').get('mixins').objectAt(options.mixinIndex);
    var property = Ember.get(detail, 'properties').findProperty('name', options.property);
    Ember.set(property, 'value', options.value);
  },

  events: {
    expandInspector: function() {
      this.set("controller.inspectorExpanded", true);
    },
    toggleInspector: function() {
      this.toggleProperty("controller.inspectorExpanded");
    }
  }

});

function arrayize(mixin) {
  Ember.NativeArray.apply(mixin.properties);
}

export default ApplicationRoute;
