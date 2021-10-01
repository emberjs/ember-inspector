import TabRoute from 'ember-inspector/routes/tab';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import fetch from 'fetch';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

function getLatestEntry(doc) {
  const regex = /^#{2} ?\[(.+)\]((?:[\s\S](?!^#{2}))+)/gm;
  const matches = doc.match(regex);
  return matches ? matches[0] : '';
}

export default class WhatsNewRoute extends TabRoute {
  @service config;
  @tracked error = false;

  model() {
    let { version } = this.config;

    let ref = version.indexOf('alpha') === -1 ? `v${version}` : 'master';
    let url = `https://raw.githubusercontent.com/emberjs/ember-inspector/${encodeURIComponent(
      ref
    )}/CHANGELOG.md`;

    return fetch(url)
      .then(checkStatus)
      .then((response) => response.text())
      .then((text) => getLatestEntry(text))
      .catch((error) => {
        this.error = error;
      });
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('error', this.error);
  }
}
