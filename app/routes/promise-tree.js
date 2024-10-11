import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import TabRoute from 'ember-inspector/routes/tab';
import PromiseAssembler from 'ember-inspector/libs/promise-assembler';

export default class PromiseTreeRoute extends TabRoute {
  @service port;

  assembler = PromiseAssembler.create({
    port: this.port,
  });

  model() {
    // block rendering until first batch arrives
    // Helps prevent flashing of "please refresh the page"
    return new Promise((resolve) => {
      this.assembler.one('firstMessageReceived', () => {
        resolve(get(this, 'assembler.topSort'));
      });
      this.assembler.start();
    });
  }

  setupController() {
    super.setupController(...arguments);

    this.port.on(
      'promise:instrumentWithStack',
      this,
      this.setInstrumentWithStack,
    );
    this.port.send('promise:getInstrumentWithStack');
  }

  deactivate() {
    this.assembler.stop();
    this.port.off(
      'promise:instrumentWithStack',
      this,
      this.setInstrumentWithStack,
    );
  }

  setInstrumentWithStack(message) {
    set(this, 'controller.instrumentWithStack', message.instrumentWithStack);
  }
}
