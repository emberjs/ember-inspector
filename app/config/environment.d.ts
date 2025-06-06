/**
 * Type declarations for
 *    import config from 'ember-inspector/config/environment'
 */
declare const config: {
  emberVersionsSupported: [fromVersion: string, tillVersion: string];
  environment: string;
  modulePrefix: string;
  podModulePrefix: string;
  locationType: 'history' | 'hash' | 'none';
  previousEmberVersionsSupported: Array<string>;
  rootURL: string;
  APP: Record<string, unknown>;
  VERSION: string;
};

export default config;
