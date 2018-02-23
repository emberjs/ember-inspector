import { run } from '@ember/runloop';
import { registerHelper } from '@ember/test';
export default registerHelper('triggerPort', async function t(app, ...args) {
  run(() => app.__container__.lookup('port:main').trigger(...args));
  await wait();
});

