import { action, computed } from '@ember/object';
import Component from '@ember/component';
import { equal, alias, and } from '@ember/object/computed';
import { next } from '@ember/runloop';
import parseText from 'ember-inspector/utils/parse-text';

export default Component.extend({
  tagName: '',
  isEdit: false,

  // Bound to editing textbox
  txtValue: null,
  dateValue: null,

  isCalculated: computed('valueType', function () {
    return this.valueType !== 'type-descriptor';
  }),

  valueType: alias('model.value.type'),

  isService: alias('model.isService'),

  isOverridden: alias('model.overridden'),

  readOnly: alias('model.readOnly'),

  isEmberObject: equal('valueType', 'type-ember-object'),

  isObject: equal('valueType', 'type-object'),

  isInstance: equal('valueType', 'type-instance'),

  isComputedProperty: alias('model.value.computed'),

  isFunction: equal('valueType', 'type-function'),

  isArray: equal('valueType', 'type-array'),

  isDate: equal('valueType', 'type-date'),

  isDepsExpanded: false,

  hasDependentKeys: and('model.dependentKeys.length', 'isCalculated'),

  showDependentKeys: and('isDepsExpanded', 'hasDependentKeys'),

  canDig() {
    return this.isInstance
      || this.isObject
      || this.isEmberObject
      || this.isArray
  },

  toggleDeps: action(function () {
    this.toggleProperty('isDepsExpanded');
  }),

  valueClick: action(function () {
    if (this.canDig()) {
      this.digDeeper();
      return;
    }

    if (this.isComputedProperty && !this.isCalculated) {
      this.calculate();
      return;
    }

    if (this.isFunction || this.isOverridden || this.readOnly) {
      return;
    }

    let value = this.get('model.value.inspect');
    let type = this.valueType;
    if (type === 'type-string') {
      // If the value is not already wrapped in quotes, wrap it
      if (!value.startsWith('"') && !value.endsWith('"')) {
        value = `"${value}"`;
      }
    }
    if (!this.isDate) {
      this.set('txtValue', value);
    } else {
      this.set('dateValue', new Date(value));
    }
    this.set('isEdit', true);
  }),

  save: action(function() {
    let realValue, dataType;
    if (!this.isDate) {
      realValue = parseText(this.txtValue);
    } else {
      realValue = this.dateValue.getTime();
      dataType = 'date';
    }

    this.saveProperty(this.get('model.name'), realValue, dataType);
    this.finishedEditing();
  }),

  finishedEditing: action(function() {
    next(() => {
      this.set('isEdit', false);
    });
  }),

  dateSelected: action(function([val]) {
    this.set('dateValue', val);
    this.save();
  }),
});

