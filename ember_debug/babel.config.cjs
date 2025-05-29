module.exports = {
  plugins: [
    ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
    ['@babel/plugin-transform-class-properties'],
    ['@babel/plugin-transform-class-static-block'],
  ],

  generatorOpts: {
    compact: false,
  },
};
