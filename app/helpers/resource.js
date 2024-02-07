import Helper from '@ember/component/helper';
import { registerDestructor, unregisterDestructor } from '@ember/destroyable';

export default class ResourceHelper extends Helper {
  compute(positional, named) {
    const firstTime = !this.updateCallback;
    this.updateCallback = named.update;
    if (named.teardown) {
      if (this.teardownCallback) {
        unregisterDestructor(this, this.teardownCallback);
      }
      this.teardownCallback = named.teardown;
      registerDestructor(this, this.teardownCallback);
    }
    if (this.updateCallback && !firstTime) {
      this.updateCallback(this.prevState, positional);
    }
    if (firstTime && named.create) {
      named.create();
    }
    //access all positional params
    positional.forEach(() => null);
    this.prevState = [...positional];
  }
}
