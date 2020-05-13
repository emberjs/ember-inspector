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

  isCalculated: alias('model.value.isCalculated'),

  valueType: alias('model.value.type'),

  isService: alias('model.isService'),

  isOverridden: alias('model.overridden'),

  readOnly: alias('model.readOnly'),

  isEmberObject: equal('valueType', 'type-ember-object'),

  isObject: equal('valueType', 'type-object'),

  isComputedProperty: alias('model.isComputed'),

  isFunction: computed('valueType', function () {
    return (
      this.valueType === 'type-function' ||
      this.valueType === 'type-asyncfunction'
    );
  }),

  isArray: equal('valueType', 'type-array'),

  isDate: equal('valueType', 'type-date'),

  isString: equal('valueType', 'type-string'),

  isDepsExpanded: false,

  hasDependentKeys: and('model.dependentKeys.length', 'isCalculated'),

  showDependentKeys: and('isDepsExpanded', 'hasDependentKeys'),

  canCalculate: computed(
    'model',
    'isCalculated',
    'isComputedProperty',
    function () {
      if (this.get('isOverridden')) return false;
      if (
        !this.get('isComputedProperty') &&
        this.get('model.isGetter') &&
        this.get('model.isExpensive')
      ) {
        return true;
      }
      return this.get('isComputedProperty') && !this.get('isCalculated');
    }
  ),

  iconInfo: computed(
    'isService',
    'isFunction',
    'model.{inspect.value,isTracked,isProperty,isGetter}',
    function () {
      if (this.get('isService')) {
        return { type: 'service', title: 'Service' };
      }

      if (this.get('isFunction')) {
        return { type: 'function', title: 'Function' };
      }

      if (this.get('model.isTracked')) {
        return { type: 'tracked', title: 'Tracked' };
      }

      if (this.get('model.isProperty')) {
        return { type: 'property', title: 'Property' };
      }

      if (this.get('model.isComputed')) {
        return { type: 'computed', title: 'Computed' };
      }

      if (this.get('model.isGetter')) {
        return { type: 'getter', title: 'Getter' };
      }

      return { type: 'n/a', title: 'N/A' };
    }
  ),

  canDig() {
    return this.isObject || this.isEmberObject || this.isArray;
  },

  cannotEdit() {
    if (this.model.name === '...' || !this.isCalculated) return true;
    return this.isFunction || this.isOverridden || this.readOnly;
  },

  toggleDeps: action(function () {
    if (this.hasDependentKeys) {
      this.toggleProperty('isDepsExpanded');
    }
  }),

  valueClick: action(function () {
    if (this.canDig()) {
      this.digDeeper();
      return;
    }

    if (this.cannotEdit()) {
      return;
    }

    let value = this.get('model.value.inspect');

    if (this.isString) {
      value = this._quotedString(value);
    }

    this.set('txtValue', value);
    this.set('isEdit', true);
  }),

  dateClick: action(function () {
    this.set('dateValue', new Date(this.get('model.value.inspect')));

    this.set('isEdit', true);
  }),

  _quotedString(value) {
    return !value.startsWith('"') && !value.endsWith('"')
      ? `"${value}"`
      : value;
  },

  save: action(function () {
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

  finishedEditing: action(function () {
    next(() => {
      this.set('isEdit', false);
    });
  }),

  dateSelected: action(function ([val]) {
    this.set('dateValue', val);
    this.save();
  }),
});
