var get = Ember.get;

var RouteNodeController = Ember.ObjectController.extend({
  needs: 'routeTree',

  details: null,

  withDetails: false,

  hasChildren: Ember.computed.gt('children.length', 0),

  style: function() {
    return 'padding-left: ' + ((this.get('numParents') * 5) + 5) + 'px';
  }.property('numParents'),


  numParents: function() {
    var numParents = this.get('target.target.numParents');
    if (numParents === undefined) {
      numParents = -1;
    }
    return numParents + 1;
  }.property("target.target.numParents"),

  isCurrent: function() {
    var currentRoute = this.get('controllers.routeTree.currentRoute');
    if (!currentRoute) {
      return false;
    }
    if (this.get('value.name') === 'application') {
      return true;
    }
    var regName = this.get('value.name').replace('.', '\\.');
    return !!currentRoute.match(new RegExp('(^|\\.)' + regName + '(\\.|$)'));
  }.property('controllers.routeTree.currentRoute', 'value.name')

});

export defaultRouteNodeController;
