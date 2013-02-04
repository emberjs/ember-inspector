(function() {
  /*global App:true Ember document location window chrome console XMLHttpRequest*/
  /*jshint evil:true*/

  "use strict";

  window.resetDebugger = function() {
    App.__container__.lookup('controller:mixinStack').set('model', []);
  };

  window.activate = function() {
    var App = window.App = Ember.Application.create();

    App.ApplicationRoute = Ember.Route.extend({
    });

    App.ApplicationController = Ember.Controller.extend({
      needs: ['mixinStack', 'mixinDetails'],

      pushMixinDetails: function(name, property, objectId, details) {
        details = { name: name, property: property, objectId: objectId, mixins: details };
        this.get('controllers.mixinStack').pushObject(details);
      },

      popMixinDetails: function() {
        var item = this.get('controllers.mixinStack').popObject();
        window.dropObject(item.objectId);
      },

      activateMixinDetails: function(name, details, objectId) {
        var objects = this.get('controllers.mixinStack').forEach(function(item) {
          window.dropObject(item.objectId);
        });

        this.set('controllers.mixinStack.model', []);
        this.pushMixinDetails(name, undefined, objectId, details);
      }
    });

    App.MixinStackController = Ember.ArrayController.extend({
      needs: ['application'],

      trail: function() {
        var nested = this.slice(1);
        if (nested.length === 0) { return ""; }
        return "." + nested.mapProperty('property').join(".");
      }.property('[]'),

      isNested: function() {
        return this.get('length') > 1;
      }.property('[]'),

      popStack: function() {
        this.get('controllers.application').popMixinDetails();
      }
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

    App.ViewTreeController = Ember.Controller.extend({

    });

    App.ViewTreeItemController = Ember.Controller.extend({

    });

    window.resetDebugger();

    Ember.$(document).on("click", "#reload-button", function() {
      location.reload(true);
    });
  };

  window.updateObject = function(options) {
    var details = options.details,
        name = options.name,
        property = options.property,
        objectId = options.objectId;

    Ember.NativeArray.apply(details);
    details.forEach(arrayize);

    var controller = App.__container__.lookup('controller:application');

    if (options.parentObject) {
      controller.pushMixinDetails(name, property, objectId, details);
    } else {
      controller.activateMixinDetails(name, details, objectId);
    }
  };

  window.updateProperty = function(options) {
    var detail = App.__container__.lookup('controller:mixinDetails').get('mixins').objectAt(options.mixinIndex);
    var property = Ember.get(detail, 'properties').findProperty('name', options.property);
    Ember.set(property, 'calculated', options.value);
  };

  window.viewTree = function(options) {
    var viewTree = App.__container__.lookup('controller:viewTree');
    viewTree.set('node', { children: [ arrayizeTree(options.tree) ] });
  };

  function arrayize(mixin) {
    Ember.NativeArray.apply(mixin.properties);
  }

  function arrayizeTree(tree) {
    Ember.NativeArray.apply(tree.children);
    tree.children.forEach(arrayizeTree);
    return tree;
  }

})();
