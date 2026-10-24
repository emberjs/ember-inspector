const ENV = {
  modulePrefix: 'ember-inspector',
  environment: import.meta.env.MODE,
  rootURL: import.meta.env.ROOT_URL,
  locationType: 'hash',
  version: import.meta.env.EMBER_INSPECTOR_VERSION,
  VERSION: import.meta.env.EMBER_INSPECTOR_VERSION,
  emberVersionsSupported: import.meta.env.EMBER_VERSIONS_SUPPORTED,
  previousEmberVersionsSupported: import.meta.env
    .PREVIOUS_EMBER_VERSIONS_SUPPORTED,
  APP: {},
};

export default ENV;
