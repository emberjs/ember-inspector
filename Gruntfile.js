module.exports = function(grunt) {
  require('matchdep')
  .filterDev('grunt-*')
  .filter(function(name){ return name !== 'grunt-cli'; })
  .forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    transpile: {
      main: {
        type: "amd",
        files: [{
          expand: true,
          cwd: 'app/',
          src: ['**/*.js'],
          dest: 'tmp/public/ember_extension'
        }]
      }
    },
    clean: ['tmp'],
    ember_handlebars: {
      compile: {
        options: {
          processName: function(filename) {
            return filename.replace(/app\/templates\//,'').replace(/\.handlebars$/,'');
          }
        },
        files: {
          "tmp/public/ember_extension/templates.js": "app/templates/*.handlebars"
        }
      }
    },
    jshint: {
      all: {
        src: [
          'Gruntfile.js',
          'tmp/public/**/*.js',
          '!tmp/public/ember_extension.js',
          '!tmp/public/vendor',
          '!tmp/public/test.js'
        ],
        options: {
          jshintrc: '.jshintrc'
        }
      }
    },
    concat: {
      main: {
        src: ['tmp/public/ember_extension/**/*.js'],
        dest: 'tmp/public/ember_extension.js'
      }
    },
    watch: {
      scripts: {
        files: ['app/**', 'vendor/**'],
        tasks: ['build']
        // ,
        // options: {
        //   nospawn: true
        // }
      }
    }
  });

  grunt.registerTask('build', ['clean', 'ember_handlebars', 'transpile', 'jshint', 'concat']);

};
