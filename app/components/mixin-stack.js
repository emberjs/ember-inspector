import Ember from 'ember';

const { computed } = Ember;

export default Ember.Component.extend({
  trail: computed('model.[]', function() {
    let nested = this.get('model').slice(1);
    if (nested.length === 0) { return ""; }
    return "." + nested.mapBy('property').join(".");
  }),

  isNested: computed('model.[]', function() {
    return this.get('model.length') > 1;
  }),

  actions: {
    popStack() {
      if (this.get('isNested')) {
        this.sendAction('popMixinDetails');
      }
    },

    sendObjectToConsole(obj) {
      let objectId = Ember.get(obj, 'objectId');
      this.get('port').send('objectInspector:sendToConsole', {
        objectId: objectId
      });
    }
  }
});
