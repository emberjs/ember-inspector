import Promise from 'models/promise';

var get = Ember.get;

var PromiseAssembler = Ember.Object.extend({
  // RSVP lib to debug
  RSVP: Ember.RSVP,

  all: Ember.computed(function() { return []; }).property(),

  start: function() {
    this.RSVP.configure('instrument', true);
    // listen for stuff
    this.RSVP.on('chained',   chain.bind(this));
    this.RSVP.on('rejected',  reject.bind(this));
    this.RSVP.on('fulfilled', fulfill.bind(this));
    this.RSVP.on('created',   create.bind(this));
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

PromiseAssembler.reopenClass({
  supported: function() {
    return !!Ember.RSVP.on;
  }
});

var fulfill = function(event) {
  var guid = event.guid;
  var promise = this.updateOrCreate(guid, {
    label: event.label,
    settledAt: event.timeStamp,
    state: 'fulfilled',
    value: event.detail
  });
};


var reject = function(event) {
  var guid = event.guid;
  var promise = this.updateOrCreate(guid, {
    label: event.label,
    settledAt: event.timeStamp,
    state: 'rejected',
    reason: event.detail
  });
};

var chain = function(event) {
  var guid = event.guid,
      promise = this.updateOrCreate(guid, {
        label: event.label,
        chainedAt: event.timeStamp
      }),
      children = promise.get('children'),
      child = this.findOrCreate(event.childGuid);

  child.set('parent', promise);
  children.pushObject(child);
};

var create = function(event) {
  var guid = event.guid;

  var promise = this.updateOrCreate(guid, {
    label: event.label,
    createdAt: event.timeStamp
  });

  // todo fix ordering
  if (Ember.isNone(promise.get('state'))) {
    promise.set('state', 'created');
  }
};


export default PromiseAssembler;
