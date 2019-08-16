import TabRoute from "ember-inspector/routes/tab";
import fetch from 'fetch';

const checkStatus = function(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
};

const getLatestEntry = function(doc) {
  const regex = /^#{2} ?\[(v?[.\d]+)\]((?:[\s\S](?!^#{2}))+)/gm;
  const matches = doc.match(regex);
  return matches ? matches[0] : '';
};

export default TabRoute.extend({
  error: false,

  model() {
    return fetch('https://raw.githubusercontent.com/emberjs/ember-inspector/master/CHANGELOG.md')
      .then(checkStatus)
      .then((response) => response.text())
      .then((text) => getLatestEntry(text))
      .catch((error) => { this.set('error', error); });
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('error', this.error);
  }
});
