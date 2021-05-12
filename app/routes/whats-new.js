import TabRoute from 'ember-inspector/routes/tab';
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
  const regex = /^#{2} ?v(.+)((?:[\s\S](?!^#{2} v))+)/gm;
  const matches = doc.match(regex);
  return matches ? matches[0] : '';
}

export default TabRoute.extend({
  error: false,

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
        this.set('error', error);
      });
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('error', this.error);
  },
});
