/**
  Original implementation and the idea behind the `PromiseAssembler`,
  `Promise` model, and other work related to promise inspection was done
  by Stefan Penner (@stefanpenner) thanks to McGraw Hill Education (@mhelabs)
  and Yapp Labs (@yapplabs).
 */

import Promise from 'models/promise';

var get = Ember.get;
var alias = Ember.computed.alias;

var PromiseAssembler = Ember.Object.extend(Ember.Evented, {
  // RSVP lib to debug
  RSVP: Ember.RSVP,

  all: Ember.computed(function() { return Ember.A(); }).property(),

  promiseIndex: Ember.computed(function() { return {}; }).property(),

  // injected on creation
  promiseDebug: null,

  existingEvents: alias('promiseDebug.existingEvents'),
  existingCallbacks: alias('promiseDebug.existingCallbacks'),

  start: function() {
    this.RSVP.configure('instrument', true);
    var self = this;

    this.promiseChained = function(e) {
      chain.call(self, e);
    };
    this.promiseRejected = function(e) {
      reject.call(self, e);
    };
    this.promiseFulfilled = function(e) {
      fulfill.call(self, e);
    };
    this.promiseCreated = function(e) {
      create.bind(self)(e);
    };


    this.RSVP.on('chained', this.promiseChained);
    this.RSVP.on('rejected', this.promiseRejected);
    this.RSVP.on('fulfilled', this.promiseFulfilled);
    this.RSVP.on('created',  this.promiseCreated);

    if (this.get('existingEvents')) {
      var callbacks = this.get('existingCallbacks');
      for (var eventName in callbacks) {
        this.RSVP.off(eventName, callbacks[eventName]);
      }
      var events = Ember.A(this.get('existingEvents'));
      events.forEach(function(e) {
        self['promise' + Ember.String.capitalize(e.eventName)].call(self, e.options);
      });
    }
  },

  stop: function() {
    this.RSVP.configure('instrument', false);
    this.RSVP.off('chained', this.promiseChained);
    this.RSVP.off('rejected', this.promiseRejected);
    this.RSVP.off('fulfilled', this.promiseFulfilled);
    this.RSVP.off('created',  this.promiseCreated);

    this.get('all').forEach(function(item) {
      item.destroy();
    });
    this.set('all', Ember.A());
    this.set('promiseIndex', {});

    this.promiseChained = null;
    this.promiseRejected = null;
    this.promiseFulfilled = null;
    this.promiseCreated = null;
  },

  willDestroy: function() {
    this.stop();
    this._super();
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

export default PromiseAssembler;

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

function chain(event) {
  /*jshint validthis:true */
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
}

function create(event) {
  /*jshint validthis:true */
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
}
