import Promise from 'models/promise';

var get = Ember.get;

var PromiseAssembler = Ember.Object.extend({
  // RSVP lib to debug
  RSVP: Ember.RSVP,

  all: function() { return []; }.property(),

  start: function() {
    var InstrumentedPromise = this.RSVP.Promise;
    // listen for stuff
    InstrumentedPromise.on('chained',   chain.bind(this));
    InstrumentedPromise.on('rejected',  resolve.bind(this));
    InstrumentedPromise.on('fulfilled', resolve.bind(this));
    InstrumentedPromise.on('created',   create.bind(this));
  },

  createPromise: function(props) {
    var promise = Promise.create(props);
    this.get('all').pushObject(promise);
    return promise;
  },

  find: function(guid){
    if (guid) {
      return this.get('all').findProperty('guid', guid);
    } else {
      return this.get('all');
    }
  },

  findOrCreate: function(guid) {
    return this.find(guid) || this.createPromise({
      guid: guid
    });
  },

  updateOrCreate: function(guid, properties){
    var entry = this.find(guid);

    if (entry) {
      entry.setProperties(properties);
    } else {
      entry = this.createPromise(properties);
    }
    entry.set('guid', guid);

    return entry;
  }
});

var resolve = function(event) {
  var guid = event.guid || event.parent;
  var promise = this.updateOrCreate(guid, event);

  var state = promise.get('state');
  promise.set('state', event.eventName);
};

var chain = function(originalEvent) {
  var event = Ember.$.extend({}, originalEvent);

  var guid = event.guid || event.parent;

  delete event.parent;

  var promise = this.updateOrCreate(guid, event);

  var children = promise.get('children') || Ember.A();
  var child = this.findOrCreate(event.child);

  child.set('parent', promise);
  children.pushObject(child);
  promise.set('children', children);
};

var create = function(event) {
  var self = this;
  Ember.run.join(function(){
    var guid = event.guid;

    var promise = self.updateOrCreate(guid, event);

    // todo fix ordering
    if (Ember.isNone(promise.get('state'))) {
      promise.set('state', 'created');
    }
  });
};


export default PromiseAssembler;
