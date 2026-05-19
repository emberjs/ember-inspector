import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class PropertiesBase extends Component {
  @service port;

  @action sendToConsole({ name }) {
    const data = {
      objectId: this.args.model.objectId,
    };

    if (name !== '...') {
      data.property = name;
    }

    this.port.send('objectInspector:sendToConsole', data);
  }

  @action gotoSource({ name }) {
    const data = {
      objectId: this.args.model.objectId,
    };
    if (name !== '...') {
      data.property = name;
    }
    this.port.send('objectInspector:gotoSource', data);
  }

  @action digDeeper({ name }) {
    this.port.send('objectInspector:digDeeper', {
      objectId: this.args.model.objectId,
      property: name,
    });
  }

  @action saveProperty(property, value, dataType) {
    this.port.send('objectInspector:saveProperty', {
      objectId: this.args.model.objectId,
      property,
      value,
      dataType,
    });
  }
}
