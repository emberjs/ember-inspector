/**
 * Type declarations for
 *    import config from 'my-app/config/environment'
 */
declare const config: {
  emberVersionsSupported: [fromVersion: string, tillVersion: string];
  environment: string;
  modulePrefix: string;
  podModulePrefix: string;
  locationType: 'history' | 'hash' | 'none' | 'auto';
  previousEmberVersionsSupported: Array<string>;
  rootURL: string;
  APP: Record<string, unknown>;
};

export default config;
