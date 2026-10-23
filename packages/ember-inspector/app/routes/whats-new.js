import TabRoute from 'ember-inspector/routes/tab';
import { service } from '@ember/service';
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

/**
 * release-plan lists the released packages under each `## Release` heading,
 * for example `* ember-inspector 4.17.0 (minor)`.
 */
function getEntryFor(version) {
  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const releaseLine = new RegExp(`^(\\* )?ember-inspector ${escaped} \\(`, 'm');

  return (doc) => {
    const entry = doc
      .split(/^(?=## )/m)
      .find(
        (section) =>
          section.startsWith('## Release') && releaseLine.test(section),
      );

    if (!entry) {
      throw new Error(`No changelog entry for ${version}`);
    }

    return entry.trim();
  };
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
    let isPrerelease = version.includes('alpha');

    /**
     * Released versions read the changelog on main, because the release tags
     * do not have one name format, and some releases have no tag.
     */
    let ref = isPrerelease ? 'release-preview' : 'main';
    let url = `https://raw.githubusercontent.com/emberjs/ember-inspector/${ref}/CHANGELOG.md`;

    return fetch(url)
      .then(checkStatus)
      .then((response) => response.text())
      .then(isPrerelease ? getLatestEntry : getEntryFor(version))
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
