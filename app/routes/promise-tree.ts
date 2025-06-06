import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import type Transition from '@ember/routing/transition';

import PromiseAssembler from '../libs/promise-assembler';
import type PortService from '../services/port';
import TabRoute from '../routes/tab';
import type PromiseTreeController from '../controllers/promise-tree';

export default class PromiseTreeRoute extends TabRoute {
  @service declare port: PortService;

  assembler: PromiseAssembler;
  declare controller: PromiseTreeController;

  constructor() {
    // eslint-disable-next-line prefer-rest-params
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

  setupController(
    controller: PromiseTreeController,
    model: unknown,
    transition: Transition,
  ) {
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

  setInstrumentWithStack = (message: { instrumentWithStack: boolean }) => {
    this.controller.instrumentWithStack = message.instrumentWithStack;
  };
}
