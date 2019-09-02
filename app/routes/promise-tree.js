import { Promise } from 'rsvp';
import TabRoute from "ember-inspector/routes/tab";

export default TabRoute.extend({
  model() {
    // block rendering until first batch arrives
    // Helps prevent flashing of "please refresh the page"
    return new Promise(resolve => {
      this.assembler.one('firstMessageReceived', () => {
        resolve(this.get('assembler.topSort'));
      });
      this.assembler.start();
    });
  },

  setupController() {
    this._super(...arguments);
    this.port.on('promise:instrumentWithStack', this, this.setInstrumentWithStack);
    this.port.send('promise:getInstrumentWithStack');
  },

  setInstrumentWithStack(message) {
    this.set('controller.instrumentWithStack', message.instrumentWithStack);
  },

  deactivate() {
    this.assembler.stop();
    this.port.off('promise:instrumentWithStack', this, this.setInstrumentWithStack);
  }
});
