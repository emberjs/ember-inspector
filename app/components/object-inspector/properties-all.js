import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import PropertiesBase from 'ember-inspector/components/object-inspector/properties-base';

const findMixin = function (mixins, property) {
  return mixins.find((m) => {
    return m.properties.includes(property);
  });
};

export default class PropertiesAll extends PropertiesBase {
  @service port;

  @action calculate(property) {
    const mixin = findMixin(this.args.model.mixins, property);

    this.port.send('objectInspector:calculate', {
      objectId: this.args.model.objectId,
      mixinIndex: this.args.model.mixins.indexOf(mixin),
      property: property.name,
    });
  }

  get flatPropertyList() {
    const props = this.args.model.mixins.map(function (mixin) {
      return mixin.properties.filter(function (p) {
        let shoulApplyCustomFilter = this.args.customFilter
          ? p.name.toLowerCase().indexOf(this.args.customFilter.toLowerCase()) >
            -1
          : true;
        return !p.hasOwnProperty('overridden') && shoulApplyCustomFilter;
      }, this);
    }, this);

    return props.flat();
  }
}
