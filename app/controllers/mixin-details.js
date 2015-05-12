import Ember from "ember";
const { Controller } = Ember;
export default Controller.extend({
  actions: {
    traceErrors() {
      this.get('port').send('objectInspector:traceErrors', {
        objectId: this.get('model.objectId')
      });
    }
  }
});
