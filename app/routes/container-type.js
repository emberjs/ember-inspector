import Ember from "ember";
import TabRoute from "ember-inspector/routes/tab";
const get = Ember.get;
const { RSVP: { Promise } } = Ember;

export default TabRoute.extend({
  setupController: function(controller) {
    controller.setProperties({
      search: '',
      searchVal: ''
    });
    this._super.apply(this, arguments);
  },
  model: function(params) {
    const type = params.type_id;
    const port = this.get('port');
    return new Promise((resolve, reject) => {
      port.one('container:instances', message => {
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
    error(err) {
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
