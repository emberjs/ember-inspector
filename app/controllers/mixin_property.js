var equal = Ember.computed.equal;
var alias = Ember.computed.alias;

export default Ember.ObjectController.extend({
  isEdit: false,

  // Bound to editing textbox
  txtValue: null,

  isCalculated: function() {
    return this.get('value.type') !== 'type-descriptor';
  }.property('value.type'),

  isEmberObject: equal('value.type', 'type-ember-object'),

  isComputedProperty: alias('value.computed'),

  isFunction: equal('value.type', 'type-function'),

  isArray: equal('value.type', 'type-array'),

  actions: {
    valueClick: function() {
      if (this.get('isEmberObject')) {
        this.get('target').send('digDeeper', this.get('model'));
        return;
      }

      if (this.get('isComputedProperty') && !this.get('isCalculated')) {
        this.get('target').send('calculate', this.get('model'));
        return;
      }

      if (this.get('isFunction') || this.get('isArray') || this.get('overridden') || this.get('readOnly')) {
        return;
      }

      var value = this.get('value.inspect');
      var type = this.get('value.type');
      if (type === 'type-string') {
        value = '"' + value + '"';
      }
      this.set('txtValue', value);
      this.set('isEdit', true);

    },

    saveProperty: function() {
      var txtValue = this.get('txtValue');
      var realValue;
      try {
        realValue = JSON.parse(txtValue);
      } catch(e) {
        realValue = txtValue;
      }
      this.get('target').send('saveProperty', this.get('name'), realValue);
    },

    finishedEditing: function() {
      this.set('isEdit', false);
    }
  }
});
