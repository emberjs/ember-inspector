import { run } from '@ember/runloop';
import wait from 'ember-test-helpers/wait';
export async function triggerPort(app, ...args) {
  run(() => app.owner.lookup('port:main').trigger(...args));
  await wait();
}

