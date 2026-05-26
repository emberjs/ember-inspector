import TabRoute from 'ember-inspector/routes/tab';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

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
  const regex = /^## Release /gm;
  const latest = regex.exec(doc);
  const previous = regex.exec(doc);

  if (latest && previous) {
    return doc.substring(latest.index, previous.index).trim();
  }

  return '';
}

function patchLernaIcons(text) {
  return text
    .replace(':breaking:', '💥')
    .replace(':rocket:', '🚀')
    .replace(':bug:', '🐛')
    .replace(':documentation:', '📝')
    .replace(':house:', '🏠');
}

export default class WhatsNewRoute extends TabRoute {
  @service config;
  @tracked error = false;

  model() {
    let { version } = this.config;

    let ref =
      version.indexOf('alpha') === -1
        ? `v${version}-ember-inspector`
        : 'release-preview';
    let url = `https://raw.githubusercontent.com/emberjs/ember-inspector/${encodeURIComponent(
      ref,
    )}/CHANGELOG.md`;

    return fetch(url)
      .then(checkStatus)
      .then((response) => response.text())
      .then(getLatestEntry)
      .then(patchLernaIcons)
      .catch((error) => {
        this.error = error;
      });
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('error', this.error);
  }
}
