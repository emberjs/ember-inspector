import Ember from 'ember';
const { computed } = Ember;
const { equal, alias } = computed;

export default Ember.Component.extend({
  tagName: '', // // TODO: fix, add classNameBindings
  isEdit: false,

  // Bound to editing textbox
  txtValue: null,
  dateValue: null,

  value: alias('model.value'),

  isCalculated: computed('value.type', function() {
    return this.get('value.type') !== 'type-descriptor';
  }),

  isEmberObject: equal('value.type', 'type-ember-object'),

  isComputedProperty: alias('value.computed'),

  isFunction: equal('value.type', 'type-function'),

  isArray: equal('value.type', 'type-array'),

  isDate: equal('value.type', 'type-date'),

  _parseTextValue(value) {
    let parsedValue;
    try {
      parsedValue = JSON.parse(value);
    } catch (e) {
      // if surrounded by quotes, remove quotes
      let match = value.match(/^"(.*)"$/);
      if (match && match.length > 1) {
        parsedValue = match[1];
      } else {
        parsedValue = value;
      }
    }
    return parsedValue;
  },

  actions: {
    calculate(property) {
      this.sendAction('calculate', property);
    },
    valueClick() {
      if (this.get('isEmberObject') || this.get('isArray')) {
        this.sendAction('digDeeper', this.get('model'));
        return;
      }

      if (this.get('isComputedProperty') && !this.get('isCalculated')) {
        this.sendAction('calculate', this.get('model'));
        return;
      }

      if (this.get('isFunction') || this.get('model.overridden') || this.get('model.readOnly')) {
        return;
      }

      let value = this.get('value.inspect');
      let type = this.get('value.type');
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

    saveProperty() {
      let realValue, dataType;
      if (!this.get('isDate')) {
        realValue = this._parseTextValue(this.get('txtValue'));
      } else {
        realValue = this.get('dateValue').getTime();
        dataType = 'date';
      }
      this.sendAction('saveProperty', this.get('model.name'), realValue, dataType);
    },

    finishedEditing() {
      this.set('isEdit', false);
    },

    sendToConsole(model) {
      this.sendAction('sendToConsole', model);
    }
  }
});
