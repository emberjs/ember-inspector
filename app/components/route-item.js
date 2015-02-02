import Ember from 'ember';
import checkCurrentRoute from "ember-inspector/utils/check-current-route";
const { Component } = Ember;

export default Component.extend({
  // passed as an attribute to the component
  currentRoute: null,

  classNames: ['list-tree__item', 'row'],
  classNameBindings: ['isCurrent:row_highlight'],
  attributeBindings: ['label:data-label'],

  label: 'route-node',

  labelStyle: function() {
    return 'padding-left: ' + ((+this.get('model.parentCount') * 20) + 5) + "px";
  }.property('model.parentCount'),

  isCurrent: function() {
    let currentRoute = this.get('currentRoute');
    if (!currentRoute) {
      return false;
    }

    return checkCurrentRoute( currentRoute, this.get('model.value.name') );
  }.property('currentRoute', 'model.value.name'),
});

