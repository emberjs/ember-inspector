import Ember from "ember";
import TabRoute from "ember-inspector/routes/tab";

const { RSVP: { Promise } } = Ember;

export default TabRoute.extend({
  model: function() {
    // block rendering until first batch arrives
    // Helps prevent flashing of "please refresh the page"
    let route = this;
    return new Promise(function(resolve) {
      route.get('assembler').one('firstMessageReceived', function() {
        resolve(route.get('assembler.topSort'));
      });
      route.get('assembler').start();
    });
  },

  setupController: function() {
    this._super.apply(this, arguments);
    this.get('port').on('promise:instrumentWithStack', this, this.setInstrumentWithStack);
    this.get('port').send('promise:getInstrumentWithStack');
  },

  setInstrumentWithStack: function(message) {
    this.set('controller.instrumentWithStack', message.instrumentWithStack);
  },

  deactivate: function() {
    this.get('assembler').stop();
    this.get('port').off('promse:getInstrumentWithStack', this, this.setInstrumentWithStack);
  },

  actions: {
    sendValueToConsole: function(promise) {
      this.get('port').send('promise:sendValueToConsole', { promiseId: promise.get('guid') });
    },

    toggleExpand: function(promise) {
      const isExpanded = !promise.get('isExpanded');
      promise.set('isManuallyExpanded', isExpanded);
      promise.recalculateExpanded();
      let children = promise._allChildren();
      if (isExpanded) {
        children.forEach(function(child) {
          let isManuallyExpanded = child.get('isManuallyExpanded');
          if (isManuallyExpanded === undefined) {
            child.set('isManuallyExpanded', isExpanded);
            child.recalculateExpanded();
          }
        });
      }
    }
  }
});
