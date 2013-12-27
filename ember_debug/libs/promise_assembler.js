import Promise from 'models/promise';

var get = Ember.get;

var PromiseAssembler = Ember.Object.extend(Ember.Evented, {
  // RSVP lib to debug
  RSVP: Ember.RSVP,

  all: Ember.computed(function() { return []; }).property(),

  promiseIndex: Ember.computed(function() { return {}; }).property(),

  start: function() {
    this.RSVP.configure('instrument', true);
    // listen for stuff
    this.RSVP.on('chained',   chain.bind(this));
    this.RSVP.on('rejected',  reject.bind(this));
    this.RSVP.on('fulfilled', fulfill.bind(this));
    this.RSVP.on('created',   create.bind(this));
  },

  createPromise: function(props) {
    var promise = Promise.create(props),
        index = this.get('all.length');

    this.get('all').pushObject(promise);
    this.get('promiseIndex')[promise.get('guid')] = index;
    return promise;
  },

  find: function(guid){
    if (guid) {
      var index = this.get('promiseIndex')[guid];
      if (index !== undefined) {
        return this.get('all').objectAt(index);
      }
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
      properties = Ember.copy(properties);
      properties.guid = guid;
      entry = this.createPromise(properties);
    }

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
  this.trigger('fulfilled', {
    promise: promise
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
  this.trigger('rejected', {
    promise: promise
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

  this.trigger('chained', {
    promise: promise,
    child: child
  });
};

var create = function(event) {
  var guid = event.guid;

  var promise = this.updateOrCreate(guid, {
    label: event.label,
    createdAt: event.timeStamp,
    stack: event.stack
  });

  // todo fix ordering
  if (Ember.isNone(promise.get('state'))) {
    promise.set('state', 'created');
  }
  this.trigger('created', {
    promise: promise
  });
};


export default PromiseAssembler;
