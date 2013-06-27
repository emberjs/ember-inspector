module.exports = function(grunt) {

  require('matchdep')
  .filterDev('grunt-*')
  .filter(function(name){ return name !== 'grunt-cli'; })
  .forEach(grunt.loadNpmTasks);

  function config(configFileName) {
    return require('./configurations/' + configFileName);
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    transpile: config('transpile'),
    clean: ['tmp'],
    ember_handlebars: config('ember_handlebars'),
    jshint: config('jshint'),
    concat: config('concat'),
    watch: config('watch'),
    connect: config('connect'),
    copy: config('copy'),
    qunit: config('qunit')
  });

  grunt.registerTask('build', [
    'clean',
    'ember_handlebars',
    'transpile:main',
    'concat:main',
    'concat:main_css',
    'build_ember_debug',
    'jshint:all',
    'copy:extension'
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
  grunt.registerTask('server', ['build_test','connect','watch']);

  grunt.registerTask('test', ['build_test', 'connect',  'qunit:all']);

  grunt.registerTask('default', ['build']);

};
