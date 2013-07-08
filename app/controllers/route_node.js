var get = Ember.get;

var RouteNodeController = Ember.ObjectController.extend({
  details: null,

  withDetails: false,

  hasChildren: Ember.computed.gt('children.length', 0),

  controllerExists: Ember.computed.alias('details.controller.exists'),

  controllerName: function() {
    var controllerName = this.get('details.controller.className');
    if (!this.get('details.controller.exists')) {
      controllerName += ' (will be generated)';
    }
    return controllerName;
  }.property('details.controller.name'),

  showDetails: function(model) {
    if (this.get('withDetails')) {
      this.set('withDetails', false);
      return;
    }
    model = model || this.get('model');
    this.get('port').one('route:routeDetails', this, function(message) {
      this.set('details', message);
      this.set('withDetails', true);
    });
    this.get('port').send('route:getRouteDetails', { name: get(model, 'value.name') });
  }


});

export = RouteNodeController;
