(function() {
  /*global App:true Ember document location window chrome console XMLHttpRequest*/
  /*jshint evil:true*/

  "use strict";

  window.resetDebugger = function() {
    App.__container__.lookup('controller:application').set('mixinDetails', []);
  };

  window.activate = function() {
    var App = window.App = Ember.Application.create();

    App.ApplicationRoute = Ember.Route.extend({
    });

    App.ApplicationController = Ember.Controller.extend({
      needs: ['mixinStack', 'mixinDetails'],

      pushMixinDetails: function(name, objectId, details) {
        details = { name: name, objectId: objectId, mixins: details };
        this.get('controllers.mixinStack').pushObject(details);
      },

      popMixinDetails: function() {
        this.get('controllers.mixinStack').popObject();
      },

      activateMixinDetails: function(name, details, objectId) {
        this.set('controllers.mixinStack.model', []);
        this.pushMixinDetails(name, objectId, details);
      }
    });

    App.MixinStackController = Ember.ArrayController.extend({

    });

    App.MixinDetailsController = Ember.ObjectController.extend({
    });

    App.MixinDetailController = Ember.ObjectController.extend({
      needs: ['mixinDetails'],

      isExpanded: function() {
        return this.get('model.name') === 'Own Properties';
      }.property('model.name'),

      digDeeper: function(property) {
        var objectId = this.get('controllers.mixinDetails.objectId');
        window.digDeeper(objectId, property);
      },

      calculate: function(property) {
        var mixinIndex = this.get('controllers.mixinDetails.mixins').indexOf(this.get('model'));
        window.calculate(property, mixinIndex);
      }
    });

    window.resetDebugger();

    Ember.$(document).on("click", "#reload-button", function() {
      location.reload(true);
    });
  };

  window.updateObject = function(options) {
    var details = options.details,
        name = options.name,
        objectId = options.objectId;

    Ember.NativeArray.apply(details);
    details.forEach(arrayize);

    App.__container__.lookup('controller:application').activateMixinDetails(name, details, objectId);
  };

  window.updateProperty = function(options) {
    var detail = App.__container__.lookup('controller:mixinDetails').get('mixins').objectAt(options.mixinIndex);
    var property = Ember.get(detail, 'properties').findProperty('name', options.property);
    Ember.set(property, 'calculated', options.value);
  };

  function arrayize(mixin) {
    Ember.NativeArray.apply(mixin.properties);
  }

})();
