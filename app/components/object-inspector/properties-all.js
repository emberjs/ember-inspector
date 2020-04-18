import { action, computed } from '@ember/object';
import PropertiesBase from 'ember-inspector/components/object-inspector/properties-base';

const findMixin = function(mixins, property) {
  return mixins.find((m) => {
    return m.properties.includes(property);
  });
};

export default PropertiesBase.extend({
  calculate: action(function(property) {
    const mixin = findMixin(this.get('model.mixins'), property);

    this.port.send('objectInspector:calculate', {
      objectId: this.model.objectId,
      mixinIndex: this.get('model.mixins').indexOf(mixin),
      property: property.name
    });
  }),

  flatPropertyList: computed('model', 'customFilter', function () {
    const props = this.get('model.mixins').map(function (mixin) {
      return mixin.properties.filter(function (p) {
        let shoulApplyCustomFilter = this.customFilter
          ? p.name.toLowerCase().indexOf(this.customFilter.toLowerCase()) > -1
          : true;
        return !p.hasOwnProperty('overridden') && shoulApplyCustomFilter;
      }, this);
    }, this);

    return props.flat();
  }),
});

