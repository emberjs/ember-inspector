import { run } from '@ember/runloop';
import { settled } from '@ember/test-helpers';
export async function triggerPort(app, ...args) {
  run(() => app.owner.lookup('service:port').trigger(...args));
  await settled();
}

