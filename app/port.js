import Evented from '@ember/object/evented';
import EmberObject, { computed } from '@ember/object';

export default EmberObject.extend(Evented, {
  applicationId: undefined,

  detectedApplications: computed(function() {
    return [];
  }),

  init() {
    const addIfNotPresent = (list, value) => {
      if (list.indexOf(value) === -1) {
        list.pushObject(value);
      }
    };

    const detectedApplications = this.get('detectedApplications');

    this.get('adapter').onMessageReceived(message => {
      if (message.type === 'app-list') {
        message.appList.forEach(applicationId => addIfNotPresent(detectedApplications, applicationId));
        return;
      }

      if (!message.applicationId) {
        return;
      }

      if (!this.get('applicationId')) {
        this.set('applicationId', message.applicationId);
      }

      // save list of application ids
      addIfNotPresent(detectedApplications, message.applicationId);

      const applicationId = this.get('applicationId');
      if (applicationId === message.applicationId) {
        this.trigger(message.type, message, applicationId);
      }
    });
  },
  send(type, message) {
    message = message || {};
    message.type = type;
    message.from = 'devtools';
    message.applicationId = this.get('applicationId');
    this.get('adapter').sendMessage(message);
  }
});
