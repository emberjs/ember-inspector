import TabRoute from 'ember-inspector/routes/tab';
import { tracked } from '@glimmer/tracking';
import config from 'ember-inspector/config/environment';

/**
 * The build copies CHANGELOG.md next to index.html.
 */
const CHANGELOG_URL = `${config.rootURL}CHANGELOG.md`;

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

function patchLernaIcons(text) {
  return text
    .replaceAll(':breaking:', '💥')
    .replaceAll(':rocket:', '🚀')
    .replaceAll(':bug:', '🐛')
    .replaceAll(':documentation:', '📝')
    .replaceAll(':house:', '🏠');
}

export default class ChangelogRoute extends TabRoute {
  @tracked error = false;

  model() {
    return fetch(CHANGELOG_URL)
      .then(checkStatus)
      .then((response) => response.text())
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
