import Promise from "models/promise";

var get = Ember.get;

var PromiseTreeRoute = Ember.Route.extend({
  promises: function() { return []; }.property(),

  model: function() {
    var self = this;
    return Ember.RSVP.Promise(function(resolve) {
      self.get('port').one('promise:promises', function(message) {
        resolve(self.rebuildPromises(message.promises));
      });
      self.get('port').send('promise:getPromises');
    });
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
