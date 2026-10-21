module.exports = {
  plugins: [
    [
      require('@babel/plugin-proposal-decorators').default,
      {
        version: 'legacy',
      },
    ],
  ],
};
