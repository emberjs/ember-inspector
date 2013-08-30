module.exports = {
  scripts: {
    files: ['app/**/*', 'vendor/**/*', 'ember_debug/**/*', 'test/**/*', 'css/**/*', 'extension_dist/*.js'],
    tasks: ['lock', 'build_test', 'unlock'],
    options: {
      nospawn: true
    }
  }
};
