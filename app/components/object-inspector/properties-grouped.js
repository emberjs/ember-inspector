import { action, computed } from '@ember/object';
import PropertiesBase from 'ember-inspector/components/object-inspector/properties-base';

export default PropertiesBase.extend({
  propertyList: computed('model', 'customFilter', function () {
    const props = this.get('model.mixins').map(function (mixin) {
      return {
        ...mixin,
        properties: mixin.properties.filter(function (p) {
          let shoulApplyCustomFilter = this.customFilter
            ? p.name.toLowerCase().indexOf(this.customFilter.toLowerCase()) > -1
            : true;
          return shoulApplyCustomFilter;
        }, this),
      }
    }, this);

    return props;
  }),

  calculate: action(function({ name }, mixin) {
    this.port.send('objectInspector:calculate', {
      objectId: this.model.objectId,
      mixinIndex: this.get('model.mixins').indexOf(mixin),
      property: name
    });
  }),
});

