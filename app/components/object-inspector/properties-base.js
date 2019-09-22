import Component from '@ember/component';
import { action } from '@ember/object';

export default Component.extend({
  tagName: '',

  sendToConsole: action(function ({ name }) {
    this.port.send('objectInspector:sendToConsole', {
      objectId: this.model.objectId,
      property: name
    });
  }),

  digDeeper: action(function({ name }) {
    this.port.send('objectInspector:digDeeper', {
      objectId: this.model.objectId,
      property: name
    });
  }),

  saveProperty: action(function(property, value, dataType) {
    this.port.send('objectInspector:saveProperty', {
      objectId: this.model.objectId,
      property,
      value,
      dataType
    });
  }),
});

