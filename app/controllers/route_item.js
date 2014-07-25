import checkCurrentRoute from 'utils/check_current_route';

var get = Ember.get;

export default Ember.ObjectController.extend({
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

    return checkCurrentRoute( currentRoute, this.get('value.name') );
  }.property('currentRoute', 'value.name')
});
