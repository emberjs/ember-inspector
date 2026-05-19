import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';

import PromiseAssembler from '../libs/promise-assembler';
import TabRoute from '../routes/tab';

export default class PromiseTreeRoute extends TabRoute {
  @service port;

  constructor() {
    super(...arguments);

    this.assembler = PromiseAssembler.create({
      port: this.port,
    });
  }

  model() {
    // block rendering until first batch arrives
    // Helps prevent flashing of "please refresh the page"
    return new Promise((resolve) => {
      this.assembler.one('firstMessageReceived', () => {
        resolve(this.assembler.topSort);
      });
      this.assembler.start();
    });
  }

  setupController(controller, model, transition) {
    super.setupController(controller, model, transition);

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

  setInstrumentWithStack = (message) => {
    this.controller.instrumentWithStack = message.instrumentWithStack;
  };
}
