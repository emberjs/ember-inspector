import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

/**
 * Keeps the message handler that the port service registers,
 * so the test can deliver messages to it.
 */
class FakeAdapter extends Service {
  receive;

  onMessageReceived(callback) {
    this.receive = callback;
  }

  sendMessage() {}

  inspectJSValue() {}
}

module('Unit | Service | port', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:adapter', FakeAdapter);
    this.port = this.owner.lookup('service:port');
    this.receive = this.owner.lookup('service:adapter').receive;
  });

  test('a message reaches the listeners of its type', function (assert) {
    this.port.on('view:renderTree', (message, applicationId) => {
      assert.step(`${message.type} from ${applicationId}`);
    });

    this.receive({
      type: 'view:renderTree',
      applicationId: 'app-1',
      applicationName: 'My App',
    });

    assert.verifySteps(['view:renderTree from app-1']);
  });

  test('a message with no listener throws', function (assert) {
    assert.throws(
      () =>
        this.receive({
          type: 'view:unknown',
          applicationId: 'app-1',
          applicationName: 'My App',
        }),
      /unknown message type view:unknown/,
    );
  });

  test('a message from another app is ignored', function (assert) {
    this.port.on('view:renderTree', () => assert.step('received'));

    this.receive({ type: 'view:renderTree', applicationId: 'app-1' });
    this.receive({ type: 'view:renderTree', applicationId: 'app-2' });
    this.receive({ type: 'view:unknown', applicationId: 'app-2' });

    assert.verifySteps(['received']);
  });
});
