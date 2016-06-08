import Ember from "ember";
const { computed, inject } = Ember;
export default Ember.Controller.extend({
  application: inject.controller(),

  trail: computed('model', function() {
    let nested = this.get('model').slice(1);
    if (nested.length === 0) { return ""; }
    return "." + nested.mapProperty('property').join(".");
  }),

  isNested: computed('model', function() {
    return this.get('model.length') > 1;
  }),

  actions: {
    popStack() {
      if (this.get('isNested')) {
        this.get('application').popMixinDetails();
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
