import TabRoute from 'ember-inspector/routes/tab';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

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
  @service router;

  @tracked error = false;

  /**
   * The build copies CHANGELOG.md next to index.html.
   */
  model() {
    return fetch(`${this.router.rootURL}CHANGELOG.md`)
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
