module.exports = {
  scripts: {
    files: ['app/**/*', 'vendor/**/*', 'ember_debug/**/*', 'test/**/*', 'css/**/*'],
    tasks: ['lock', 'build_test', 'unlock'],
    options: {
      nospawn: true
    }
  }
};
