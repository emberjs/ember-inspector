(function() {
  /*global App:true Ember document location window*/
  "use strict";

  var App = window.App = Ember.Application.create();

  App.Utils = Ember.Namespace.create();

  App.ApplicationRoute = Ember.Route.extend({
    setupController: function(controller) {
      var arrayProxy = Ember.ArrayProxy.create({ content: [ Ember.Object.create(), Ember.Object.create() ] });

      var mixinDetails = App.Utils.mixinsForObject(arrayProxy),
          arrayController = this.controllerFor('mixinDetails').set('model', mixinDetails);

      mixinDetails = { name: arrayProxy.toString(), mixins: arrayController };
      controller.set('mixinDetails', mixinDetails);
    }
  });

  App.ApplicationController = Ember.Controller.extend({
    example: Ember.View.create()
  });

  App.MixinDetailController = Ember.ObjectController.extend({
    isExpanded: function() {
      return this.get('model.name') === 'Own Properties';
    }.property('model.name')
  });

  App.MixinDetailsController = Ember.ArrayController.extend({
    itemController: 'mixinDetail'
  });

  Ember.$(document).on("click", "#reload-button", function() {
    location.reload(true);
  });

  function mixinsForObject(object) {
    var mixins = Ember.Mixin.mixins(object),
        mixinDetails = [];

    var ownProps = propertiesForMixin({ mixins: [{ properties: object }] });
    mixinDetails.push({ name: "Own Properties", properties: ownProps });

    mixins.forEach(function(mixin) {
      mixin.toString();
      var name = mixin[Ember.NAME_KEY] || mixin.ownerConstructor || Ember.guidFor(name);
      mixinDetails.push({ name: name, properties: propertiesForMixin(mixin) });
    });

    applyMixinOverrides(mixinDetails);

    return mixinDetails;
  }

  App.Utils.mixinsForObject = mixinsForObject;

  function applyMixinOverrides(mixinDetails) {
    var seen = {};

    mixinDetails.forEach(function(detail) {
      detail.properties.forEach(function(property) {
        if (Object.prototype.hasOwnProperty(property.name)) { return; }

        if (seen[property.name]) {
          property.overridden = seen[property.name];
        }

        seen[property.name] = detail.name;
      });
    });
  }

  function propertiesForMixin(mixin) {
    var seen = {}, properties = [];

    mixin.mixins.forEach(function(mixin) {
      if (mixin.properties) {
        addProperties(properties, mixin.properties);
      }
    });

    return properties;
  }

  function addProperties(properties, hash) {
    for (var prop in hash) {
      if (!hash.hasOwnProperty(prop)) { continue; }
      if (prop.charAt(0) === '_') { continue; }
      replaceProperty(properties, prop, hash[prop]);
    }
  }

  function replaceProperty(properties, name, value) {
    var found, type;

    for (var i=0, l=properties.length; i<l; i++) {
      if (properties[i].name === name) {
        found = i;
        break;
      }
    }

    if (found) { properties.splice(i, 1); }

    if (name) {
      type = name.PrototypeMixin ? 'ember-class' : 'ember-mixin';
    }

    properties.push({ name: name, value: inspectValue(value) });
  }

  function inspectValue(value) {
    var string;

    if (value instanceof Ember.Object) {
      return { type: "type-ember-object", inspect: value.toString() };
    } else if (value instanceof Ember.ComputedProperty) {
      if (!value._dependentKeys) { string = "<computed>"; }
      else { string = "<computed> \u27a4 " + value._dependentKeys.join(", "); }
      return { type: "type-descriptor", inspect: string };
    } else if (value instanceof Ember.Descriptor) {
      return { type: "type-descriptor", inspect: value.toString() };
    } else {
      return { type: "type-" + Ember.typeOf(value), inspect: inspect(value) };
    }
  }

  function inspect(value) {
    if (typeof value === 'function') {
      return "function() { ... }";
    } else if (value instanceof Ember.Object) {
      return value.toString();
    } else if (Ember.typeOf(value) === 'array') {
      if (value.length === 0) { return '[]'; }
      else if (value.length === 1) { return '[ ' + inspect(value[0]) + ' ]'; }
      else { return '[ ' + inspect(value[0]) + ', ... ]'; }
    } else {
      return Ember.inspect(value);
    }
  }

})();
