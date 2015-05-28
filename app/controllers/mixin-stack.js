import Ember from "ember";
const { computed } = Ember;
export default Ember.ArrayController.extend({
  needs: ['application'],

  trail: computed('[]', function() {
    let nested = this.slice(1);
    if (nested.length === 0) { return ""; }
    return "." + nested.mapProperty('property').join(".");
  }),

  isNested: computed('[]', function() {
    return this.get('length') > 1;
  }),


  actions: {
    popStack() {
      if (this.get('isNested')) {
        this.get('controllers.application').popMixinDetails();
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
