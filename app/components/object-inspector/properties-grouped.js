import { action } from '@ember/object';
import PropertiesBase from 'ember-inspector/components/object-inspector/properties-base';

export default PropertiesBase.extend({
  calculate: action(function ({ name }, mixin) {
    this.port.send('objectInspector:calculate', {
      objectId: this.model.objectId,
      mixinIndex: this.get('model.mixins').indexOf(mixin),
      property: name,
    });
  }),
});
