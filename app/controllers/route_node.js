var get = Ember.get;

var RouteNodeController = Ember.ObjectController.extend({
  needs: 'routeTree',

  details: null,

  withDetails: false,

  hasChildren: Ember.computed.gt('children.length', 0),

  style: function() {
    return 'padding-left: ' + ((this.get('numParents') * 5) + 5) + 'px';
  }.property('numParents'),

  isCurrent: function() {
    var currentRoute = this.get('controllers.routeTree.currentRoute');
    var routes = currentRoute.split('.');
    var self = this;
    var length = routes.length;
    if (length > 1 && routes[length - 2] + '.' + routes[length - 1] === this.get('value.name')) {
      return true;
    }
    var found = false;
    routes.forEach(function(route) {
      if (self.get('value.name') === route) {
        found = true;
        return false;
      }
    });
    return found;
  }.property('controllers.routeTree.currentRoute', 'value.name'),

  numParents: function() {
    var numParents = this.get('target.target.numParents');
    if (numParents === undefined) {
      numParents = -1;
    }
    return numParents + 1;
  }.property("target.target.numParents"),

  numParentsArray: function() {
    var a = [];
    for (var i = 0; i < this.get('numParents'); i++) {
      a.pushObject(null);
    }
    return a;
  }.property('numParents')

});

export = RouteNodeController;
