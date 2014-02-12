var get = Ember.get;

var RouteItemController = Ember.ObjectController.extend({
  needs: 'routeTree',

  details: null,

  withDetails: false,

  hasChildren: Ember.computed.gt('children.length', 0),

  labelStyle: function() {
    return 'padding-left: ' + ((+this.get('model.parentCount') * 20) + 5) + "px";
  }.property('parentCount'),

  currentRoute: Ember.computed.alias('controllers.routeTree.currentRoute'),

  isCurrent: function() {
    var currentRoute = this.get('currentRoute');
    if (!currentRoute) {
      return false;
    }
    if (this.get('value.name') === 'application') {
      return true;
    }

    var regName = this.get('value.name').replace('.', '\\.');
    var val = !!currentRoute.match(new RegExp('(^|\\.)' + regName + '(\\.|$)'));
    return val;
  }.property('currentRoute', 'value.name')

});

export default RouteItemController;
