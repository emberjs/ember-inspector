import { set } from '@ember/object';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
// @ts-expect-error TODO: not yet typed
import TabRoute from 'ember-inspector/routes/tab';

import PromiseAssembler from '../libs/promise-assembler';
import type PortService from '../services/port';

export default class PromiseTreeRoute extends TabRoute {
  @service declare port: PortService;

  assembler: PromiseAssembler;

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
