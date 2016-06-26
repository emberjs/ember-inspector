import Ember from 'ember';

const { computed } = Ember;

export default Ember.Component.extend({
  isExpanded: computed('model.expand', 'model.properties.length', function() {
    return this.get('model.expand') && this.get('model.properties.length') > 0;
  }),

  actions: {
    calculate(property) {
      this.sendAction('calculate', property, this.get('model'));
    },

    sendToConsole(property) {
      this.sendAction('sendToConsole', property);
    },

    toggleExpanded() {
      this.toggleProperty('isExpanded');
    },

    digDeeper(property) {
      this.sendAction('digDeeper', property);
    },

    saveProperty(prop, val, type) {
      this.sendAction('saveProperty', prop, val, type, this.get('model'));
    }
  }
});
