import Ember from 'ember';
import checkCurrentRoute from "ember-inspector/utils/check-current-route";
const { Component, computed, Handlebars: { SafeString } } = Ember;

export default Component.extend({
  // passed as an attribute to the component
  currentRoute: null,

  classNames: ['list-tree__item', 'row', 'js-route-node'],

  classNameBindings: ['isCurrent:row_highlight'],

  labelStyle: computed('model.parentCount', function() {
    return new SafeString(`padding-left: ${+this.get('model.parentCount') * 20 + 5}px;`);
  }),

  isCurrent: computed('currentRoute', 'model.value.name', function() {
    let currentRoute = this.get('currentRoute');
    if (!currentRoute) {
      return false;
    }

    return checkCurrentRoute( currentRoute, this.get('model.value.name') );
  })
});
