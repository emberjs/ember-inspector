import { buildMacros } from '@embroider/macros/babel';

const isProduction = process.env.NODE_ENV === 'production';

const macros = buildMacros({
  configure(config) {
    if (process.env.EMBER_ENV === 'test') {
      config.enableRuntimeMode();
    }
  },
});

export default {
  plugins: [
    [
      'babel-plugin-ember-template-compilation',
      {
        transforms: macros.templateMacros,
      },
    ],
    [
      'module:decorator-transforms',
      {
        runtime: {
          import: import.meta.resolve('decorator-transforms/runtime-esm'),
        },
      },
    ],
    [
      '@babel/plugin-transform-runtime',
      {
        absoluteRuntime: import.meta.dirname,
        useESModules: true,
        regenerator: false,
      },
    ],
    isProduction && [
      'babel-plugin-debug-macros',
      {
        debugTools: {
          isDebug: false,
          source: '@ember/debug',
          assertPredicateIndex: 1,
        },
        externalizeHelpers: {
          module: '@ember/debug',
        },
      },
      '@ember/debug stripping',
    ],
  ]
    .concat(macros.babelMacros)
    .filter(Boolean),

  generatorOpts: {
    compact: false,
  },
};
