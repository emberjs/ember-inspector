import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import PropertiesBase from 'ember-inspector/components/object-inspector/properties-base';

export default class PropertiesGrouped extends PropertiesBase {
  @service port;

  @action calculate({ name }, mixin) {
    this.port.send('objectInspector:calculate', {
      objectId: this.args.model.objectId,
      mixinIndex: this.args.model.mixins.indexOf(mixin),
      property: name,
    });
  }
}
