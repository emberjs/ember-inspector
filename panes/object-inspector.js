(function() {
  /*global App:true Ember document location window chrome*/
  "use strict";

  window.activate = function() {
    var url = chrome.extension.getURL('panes/ember-debug.js');

    var xhr = new XMLHttpRequest();
    xhr.open("GET", chrome.extension.getURL('/panes/ember-debug.js'), false);
    xhr.send();

    chrome.devtools.inspectedWindow.eval(xhr.responseText);

    var App = window.App = Ember.Application.create();

    App.ApplicationRoute = Ember.Route.extend({
    });

    App.ApplicationController = Ember.Controller.extend({
      activateMixinDetails: function(name, details) {
        var arrayController = this.controllerFor('mixinDetails').set('model', details);

        details = { name: name, mixins: arrayController };
        this.set('mixinDetails', details);
      }
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
  };

  window.updateObject = function(options) {
    var details = options.details,
        name = options.name;

    Ember.NativeArray.apply(details);
    details.forEach(arrayize);

    App.__container__.lookup('controller:application').activateMixinDetails(name, details);
  };

  function arrayize(mixin) {
    Ember.NativeArray.apply(mixin.properties);
  }

})();
