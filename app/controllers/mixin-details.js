import Ember from "ember";
const { Controller, computed } = Ember;
export default Controller.extend({
  objectId: computed.alias('model.objectId'),
  actions: {
    traceErrors() {
      this.get('port').send('objectInspector:traceErrors', {
        objectId: this.get('model.objectId')
      });
    },

    calculate(property, mixin) {
      let objectId = this.get('objectId');
      let mixinIndex = this.get('model.mixins').indexOf(mixin);

      this.get('port').send('objectInspector:calculate', {
        objectId: objectId,
        property: property.name,
        mixinIndex: mixinIndex
      });
    },

    sendToConsole(property) {
      let objectId = this.get('objectId');

      this.get('port').send('objectInspector:sendToConsole', {
        objectId: objectId,
        property: property.name
      });
    },

    toggleExpanded() {
      this.toggleProperty('isExpanded');
    },

    digDeeper(property) {
      let objectId = this.get('objectId');

      this.get('port').send('objectInspector:digDeeper', {
        objectId: objectId,
        property: property.name
      });
    },

    saveProperty(prop, val, type, mixin) {
      let mixinIndex = this.get('model.mixins').indexOf(mixin);

      this.get('port').send('objectInspector:saveProperty', {
        objectId: this.get('objectId'),
        property: prop,
        value: val,
        mixinIndex: mixinIndex,
        dataType: type
      });
    }
  }
});
