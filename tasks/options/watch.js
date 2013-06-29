module.exports = {
  scripts: {
    files: ['app/**', 'vendor/**', 'ember_debug/**', 'test/**/*', 'css/**/*'],
    tasks: ['lock', 'build_test', 'unlock']
    // TODO: Figure out why nospawn fails to detect file changes
    // ,
    // options: {
    //   nospawn: true
    // }
  }
};
