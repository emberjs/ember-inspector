import Promise from "models/promise";

var get = Ember.get;

var PromiseTreeRoute = Ember.Route.extend({

  promises: function() { return []; }.property(),

  setupController: function(controller, model) {
    this._super.apply(this, arguments);
    this.set('promises', []);
    this.get('port').on('promise:promisesAdded', this, this.addPromises);
    this.get('port').on('promise:promisesUpdated', this, this.updatePromises);
    this.get('port').send('promise:getAndObservePromises');
  },

  model: function() {
    return [];
  },

  deactivate: function() {
    this.get('port').off('promise:promiseAdded', this, this.addPromises);
    this.get('port').off('promise:promiseUpdated', this, this.updatePromises);
    this.get('port').send('promise:releasePromises');
  },

  addPromises: function(message) {
    this.get('currentModel').pushObjects(this.rebuildPromises(message.promises));
  },

  updatePromises: function(message) {
    this.rebuildPromises(message.promises);
  },

  rebuildPromises: function(promises) {
    var promiseArray = [], self = this;
    promises.forEach(function(props) {
      var promise = self.updateOrCreate(props);
      var children = props.children;
      if(children) {
        var childrenArray = [];
        children.forEach(function(child) {
          childrenArray.pushObject(self.updateOrCreate({ guid: child }));
        });
        promise.set('children', childrenArray);
      }
      if (props.parent) {
        promise.set('parent', self.updateOrCreate({ guid: props.parent }));
      }
      promiseArray.pushObject(promise);
    });
    return promiseArray;
  },

  updateOrCreate: function(props) {
    props = Ember.$.extend({}, props);
    delete props.children;
    delete props.parent;
    var promise = this.get('promises').findBy('guid', get(props, 'guid'));
    if (!promise) {
      promise = Promise.create();
      this.get('promises').pushObject(promise);
    }
    promise.setProperties(props);
    return promise;
  }
});

export default PromiseTreeRoute;
