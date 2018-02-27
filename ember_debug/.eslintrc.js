module.exports = {
  root: true,
  extends: '../.eslintrc.js',
  rules: {
    'no-useless-escape': 'off',

    // TODO: turn this back on when we figure out switching from window.Ember to imports
    'ember/new-module-imports': 'off'
  }
};
