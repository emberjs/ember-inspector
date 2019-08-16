import { action, computed } from '@ember/object';
import Component from '@ember/component';
import { equal, alias, and } from '@ember/object/computed';
import { next } from '@ember/runloop';
import parseText from 'ember-inspector/utils/parse-text';

export default Component.extend({
  tagName: '',
  isEdit: false,

  /**
   * Passed through the template.
   *
   * The mixin-detail component
   * @type {Ember.Component}
   */
  mixin: null,

  // Bound to editing textbox
  txtValue: null,
  dateValue: null,

  isCalculated: computed('valueType', function () {
    return this.valueType !== 'type-descriptor';
  }),

  valueType: alias('model.value.type'),

  isService: alias('model.isService'),

  isOverridden: alias('model.overridden'),

  isEmberObject: equal('valueType', 'type-ember-object'),

  isComputedProperty: alias('model.value.computed'),

  isFunction: equal('valueType', 'type-function'),

  isArray: equal('valueType', 'type-array'),

  isDate: equal('valueType', 'type-date'),

  isDepsExpanded: false,

  hasDependentKeys: and('model.dependentKeys.length', 'isCalculated'),

  showDependentKeys: and('isDepsExpanded', 'hasDependentKeys'),

  toggleDeps: action(function () {
    this.toggleProperty('isDepsExpanded');
  }),

  valueClick: action(function () {
    if (this.isEmberObject || this.isArray) {
      this.mixin.send('digDeeper', this.model);
      return;
    }

    if (this.isComputedProperty && !this.isCalculated) {
      this.mixin.send('calculate', this.model);
      return;
    }

    if (this.isFunction || this.get('model.overridden') || this.get('model.readOnly')) {
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

  actions: {
    saveProperty() {
      let realValue, dataType;
      if (!this.isDate) {
        realValue = parseText(this.txtValue);
      } else {
        realValue = this.dateValue.getTime();
        dataType = 'date';
      }
      this.mixin.send('saveProperty', this.get('model.name'), realValue, dataType);
    },

    finishedEditing() {
      next(() => {
        this.set('isEdit', false);
      });
    },

    dateSelected([val]) {
      this.set('dateValue', val);
      this.send('saveProperty');
      this.send('finishedEditing');
    }
  }
});
