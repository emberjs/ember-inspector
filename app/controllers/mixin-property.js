import Ember from "ember";
var equal = Ember.computed.equal;
var alias = Ember.computed.alias;

export default Ember.ObjectController.extend({
  isEdit: false,

  // Bound to editing textbox
  txtValue: null,
  dateValue: null,

  isCalculated: function() {
    return this.get('value.type') !== 'type-descriptor';
  }.property('value.type'),

  isEmberObject: equal('value.type', 'type-ember-object'),

  isComputedProperty: alias('value.computed'),

  isFunction: equal('value.type', 'type-function'),

  isArray: equal('value.type', 'type-array'),

  isDate: equal('value.type', 'type-date'),

  _parseTextValue: function(value) {
    var parsedValue;
    try {
      parsedValue = JSON.parse(value);
    } catch(e) {
      // if surrounded by quotes, remove quotes
      var match = value.match(/^"(.*)"$/);
      if (match && match.length > 1) {
        parsedValue = match[1];
      } else {
        parsedValue = value;
      }
    }
    return parsedValue;
  },

  actions: {
    valueClick: function() {
      if (this.get('isEmberObject') || this.get('isArray')) {
        this.get('target').send('digDeeper', this.get('model'));
        return;
      }

      if (this.get('isComputedProperty') && !this.get('isCalculated')) {
        this.get('target').send('calculate', this.get('model'));
        return;
      }

      if (this.get('isFunction') || this.get('overridden') || this.get('readOnly')) {
        return;
      }

      var value = this.get('value.inspect');
      var type = this.get('value.type');
      if (type === 'type-string') {
        value = '"' + value + '"';
      }
      if (!this.get('isDate')) {
        this.set('txtValue', value);
      } else {
        this.set('dateValue', new Date(value));
      }
      this.set('isEdit', true);

    },

    saveProperty: function() {
      var realValue, dataType;
      if (!this.get('isDate')) {
        realValue = this._parseTextValue(this.get('txtValue'));
      } else {
        realValue = this.get('dateValue').getTime();
        dataType = 'date';
      }
      this.get('target').send('saveProperty', this.get('name'), realValue, dataType);
    },

    finishedEditing: function() {
      this.set('isEdit', false);
    }
  }
});
