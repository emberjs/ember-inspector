module.exports = function(grunt) {

  function loadFrom(path, config) {
    var glob = require('glob'),
    object = {};

    glob.sync('*', {cwd: path}).forEach(function(option) {
      var key = option.replace(/\.js$/,'');
      config[key] = require(path + option);
    });
  }

  var config = {
    pkg: grunt.file.readJSON('package.json'),
    env: process.env,
    clean: ['tmp']
  };

  loadFrom('./tasks/options/', config);

  grunt.initConfig(config);

  require('matchdep')
  .filterDev('grunt-*')
  .filter(function(name){ return name !== 'grunt-cli'; })
  .forEach(grunt.loadNpmTasks);

  grunt.loadTasks('tasks');

  grunt.registerTask('build', [
    'clean',
    'ember_handlebars',
    'transpile:main',
    'concat:main',
    'concat:main_css',
    'build_ember_debug',
    'jshint:all',
    'copy:extension',
    'copy:ff_extension'
  ]);

  grunt.registerTask('build_ember_debug', [
    'transpile:ember_debug',
    'copy:ember_debug',
    'concat:ember_debug'
  ]);

  grunt.registerTask('build_test', [
    'build',
    'transpile:tests',
    'copy:tests',
    'concat:ember_extension_tests',
    'concat:ember_debug_tests',
    'jshint:tests'
  ]);

  grunt.registerTask('build_and_upload', [
    'build',
    'compress:main',
    'ember-s3'
  ]);

  grunt.registerTask('server', ['build_test','connect','watch']);

  grunt.registerTask('test', ['build_test', 'connect',  'qunit:all']);

  grunt.registerTask('default', ['build']);

};
