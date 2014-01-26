export default Ember.ArrayController.extend({
  needs: ['application'],

  trail: function() {
    var nested = this.slice(1);
    if (nested.length === 0) { return ""; }
    return "." + nested.mapProperty('property').join(".");
  }.property('[]'),

  isNested: function() {
    return this.get('length') > 1;
  }.property('[]'),


  actions: {
    popStack: function() {
      if(this.get('isNested')) {
        this.get('controllers.application').popMixinDetails();
      }
    },

    sendObjectToConsole: function(obj) {
      var objectId = Ember.get(obj, 'objectId');
      this.get('port').send('objectInspector:sendToConsole', {
        objectId: objectId
      });
    }
  }
});
