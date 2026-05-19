import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class AppPickerComponent extends Component {
  @service port;

  get apps() {
    return this.port.detectedApplications;
  }

  get selectedAppId() {
    return this.port.applicationId;
  }

  constructor() {
    super(...arguments);
    this.port.send('app-picker-loaded');
  }

  @action
  selectApp(event) {
    let applicationId = event.target.value;
    this.port.selectApplication(applicationId);
  }
}
