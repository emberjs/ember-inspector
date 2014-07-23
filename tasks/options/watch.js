module.exports = {
  scripts: {
    files: ['app/**/*', 'vendor/**/*', 'ember_debug/**/*', 'test/**/*', 'css/**/*'],
    tasks: ['lock', 'build_test', 'unlock'],
    options: {
      nospawn: true
    }
  },

  development: {
    files: ['app/**/*', 'vendor/**/*', 'ember_debug/**/*', 'templates/**/*', 'css/**/*'],
    tasks: ['lock', 'build_dev', 'unlock'],
    options: {
      nospawn: true
    }
  }
};
