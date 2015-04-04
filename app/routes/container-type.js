import Ember from "ember";
import TabRoute from "ember-inspector/routes/tab";
var get = Ember.get;
var Promise = Ember.RSVP.Promise;

export default TabRoute.extend({
  setupController: function(controller) {
    controller.setProperties({
      search: '',
      searchVal: ''
    });
    this._super.apply(this, arguments);
  },
  model: function(params) {
    var type = params.type_id;
    var port = this.get('port');
    return new Promise(function(resolve, reject) {
      port.one('container:instances', function(message) {
        if (message.status === 200) {
          resolve(message.instances);
        } else {
          reject(message);
        }
      });
      port.send('container:getInstances', { containerType: type });
    });
  },


  actions: {
    error: function(err) {
      if (err && err.status === 404) {
        this.transitionTo('container-types.index');
      }
    },
    inspectInstance: function(obj) {
      if (!get(obj, 'inspectable')) {
        return;
      }
      this.get('port').send('objectInspector:inspectByContainerLookup', { name: get(obj, 'fullName') });
    },
    sendInstanceToConsole: function(obj) {
      this.get('port').send('container:sendInstanceToConsole', { name: get(obj, 'fullName') });
    }
  }
});
