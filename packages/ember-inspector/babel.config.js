/* eslint-env node */

module.exports = {
  plugins: [
    [
      require('@babel/plugin-proposal-decorators').default,
      {
        legacy: true,
      },
    ],
  ],
};
