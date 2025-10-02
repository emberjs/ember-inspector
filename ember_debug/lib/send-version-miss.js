let channel = new MessageChannel();
let port = channel.port1;
window.postMessage('debugger-client', '*', [channel.port2]);

let registeredMiss = false;

/**
 * This function is called if the app's Ember version
 * is not supported by this version of the inspector.
 *
 * It sends a message to the inspector app to redirect
 * to an inspector version that supports this Ember version.
 */
export default function sendVersionMiss(VERSION) {
  if (registeredMiss) {
    return;
  }

  registeredMiss = true;

  port.addEventListener('message', (message) => {
    if (message.type === 'check-version') {
      sendVersionMismatch();
    }
  });

  sendVersionMismatch();

  port.start();

  function sendVersionMismatch() {
    port.postMessage({
      name: 'version-mismatch',
      version: VERSION,
      from: 'inspectedWindow',
    });
  }
}
