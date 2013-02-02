(function() {
  /*global App:true Ember document location window chrome console XMLHttpRequest*/
  /*jshint evil:true*/

  "use strict";

  window.resetDebugger = function() {
    App.__container__.lookup('controller:application').set('mixinDetails', null);
  };

  window.activate = function() {
    var App = window.App = Ember.Application.create();

    App.ApplicationRoute = Ember.Route.extend({
    });

    App.ApplicationController = Ember.Controller.extend({
      needs: ['mixinDetails'],

      activateMixinDetails: function(name, details) {
        var arrayController = this.get('controllers.mixinDetails');
        arrayController.set('model', details);

        details = { name: name, mixins: arrayController };
        this.set('mixinDetails', details);
      }
    });

    App.MixinDetailController = Ember.ObjectController.extend({
      needs: ['mixinDetails'],

      isExpanded: function() {
        return this.get('model.name') === 'Own Properties';
      }.property('model.name'),

      calculate: function(property) {
        var mixinIndex = this.get('controllers.mixinDetails').indexOf(this);
        window.calculate(property, mixinIndex);
      }
    });

    App.MixinDetailsController = Ember.ArrayController.extend({
      itemController: 'mixinDetail'
    });

    window.resetDebugger();

    Ember.$(document).on("click", "#reload-button", function() {
      location.reload(true);
    });
  };

  window.updateObject = function(options) {
    var details = options.details,
        name = options.name;

    Ember.NativeArray.apply(details);
    details.forEach(arrayize);

    App.__container__.lookup('controller:application').activateMixinDetails(name, details);
  };

  window.updateProperty = function(options) {
    var detail = App.__container__.lookup('controller:mixinDetails').objectAt(options.mixinIndex);
    var property = detail.get('properties').findProperty('name', options.property);
    Ember.set(property, 'calculated', options.value);
  };

  function arrayize(mixin) {
    Ember.NativeArray.apply(mixin.properties);
  }

})();
