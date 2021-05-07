import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class AppConfigComponent extends Component {
  @service port;

  get apps() {
    return this.port.detectedApplications;
  }

  get selectedAppId() {
    return this.port.applicationId;
  }

  get selectedAppName() {
    // can you use this to get name instead and erase other 2 or is id/name sometimes different?
    console.log('xxx', this.port.applicationName);
    return this.apps[this.selectedAppId];
  }

  // get selectedAppDetails() {
  //   const env = requireModule(`${this.selectedAppName}/config/environment`);
  //   return env;
  // }
}

// route would be `${this.selectedAppName}/config/environment`
