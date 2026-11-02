/**
 * Run `callback` and return the first message of `type`
 * that ember-debug sends, as a JSON copy.
 *
 * Waits up to 500 ms for the message after `callback` resolves.
 *
 * @param {Object} EmberDebug The ember-debug instance under test.
 * @param {string} type The message type, for example `view:renderTree`.
 * @param {Function} callback Makes ember-debug send the message.
 * @param {Function} [match] Skips messages of `type` that return false.
 */
export async function captureMessage(
  EmberDebug,
  type,
  callback,
  match = () => true,
) {
  if (!EmberDebug.port) {
    throw new Error('Cannot call captureMessage without a port');
  }

  let send = EmberDebug.port.send;

  try {
    let captured;

    const receivedPromise = new Promise((resolve) => {
      setTimeout(resolve, 500);
      EmberDebug.port.send = (name, message) => {
        if (!captured && name === type && match(message)) {
          resolve();
          captured = JSON.parse(JSON.stringify(message));
        } else {
          send.call(EmberDebug.port, name, message);
        }
      };
    });

    await callback();
    await receivedPromise;

    if (captured) {
      return captured;
    } else {
      throw new Error(`Did not send a message of type ${type}`);
    }
  } finally {
    EmberDebug.port.send = send;
  }
}

export async function getRenderTree(EmberDebug) {
  let message = await captureMessage(EmberDebug, 'view:renderTree', () => {
    EmberDebug.port.trigger('view:getTree', {});
  });

  return message?.tree;
}
