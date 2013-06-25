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
      },
      ember_debug: {
        type: "amd",
        files: [{
          expand: true,
          cwd: 'ember_debug/',
          src: ['**/*.js', '!vendor/*.js'],
          dest: 'tmp/public/ember_debug'
        }]
      },
      tests: {
        type: "amd",
        files: [{
          expand: true,
          cwd: 'test/',
          src: ['**/*.js', '!vendor/**'],
          dest: 'tmp/public/test'
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
          '!tmp/public/test.js',
          '!tmp/public/ember_debug/vendor/*.js',
          '!tmp/public/ember_debug.js'
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
      },
      main_css: {
        src: ['css/**/*.css'],
        dest: 'tmp/public/ember_extension.css'
      },
      ember_debug: {
        src: ['tmp/public/ember_debug/vendor/*.js', 'tmp/public/ember_debug/**/*.js'],
        dest: 'tmp/public/ember_debug.js'
      },
      tests: {
        src: ['tmp/public/test/**/*.js', '!tmp/public/test/vendor/**'],
        dest: 'tmp/public/test.js'
      }
    },
    watch: {
      scripts: {
        files: ['app/**', 'vendor/**', 'ember_debug/**', 'test/**/*', 'css/**/*'],
        tasks: ['build', 'test']
      }
    },
    connect: {
      server: {
        options: {
          port: 9292,
          hostname: '127.0.0.1',
          base: 'tmp/public'
        }
      }
    },
    copy: {
      ember_debug: {
        files: [{
          expand: true,
          cwd: 'ember_debug/vendor',
          src: ['**'],
          dest: 'tmp/public/ember_debug/vendor'
        }]
      },
      extension: {
        files: [{
          src: ['tmp/public/ember_debug.js'],
          dest: 'extension/ember_debug/ember_debug.js'
        }, {
          src: ['tmp/public/ember_extension.js'],
          dest: 'extension/panes/ember_extension.js'
        }, {
          expand: true,
          cwd: 'vendor',
          src: ['**'],
          dest: 'extension/vendor/'
        }, {
          src: ['tmp/public/ember_extension.css'],
          dest: 'extension/panes/ember_extension.css'
        }]
      },
      tests: {
        files: [
        {
          expand: true,
          cwd: 'test',
          src: ['vendor/**'],
          dest: 'tmp/public/test'
        }, {
          src: ['test/index.html'],
          dest: 'tmp/public/index.html'
        }, {
          expand: true,
          cwd: 'vendor',
          src: ['**'],
          dest: 'tmp/public/vendor'
        }
        ]
      }
    }
  });

  grunt.registerTask('build', [
    'clean',
    'ember_handlebars',
    'transpile:main',
    'concat:main',
    'concat:main_css',
    'build_ember_debug',
    'jshint',
    'copy:extension'
  ]);

  grunt.registerTask('build_ember_debug', ['transpile:ember_debug', 'copy:ember_debug', 'concat:ember_debug']);
  grunt.registerTask('server', ['test','connect','watch']);

  grunt.registerTask('test', ['build', 'transpile:tests', 'copy:tests', 'concat:tests']);


  grunt.registerTask('default', ['build']);

};
