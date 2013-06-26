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
          cwd: 'test/ember_extension/',
          src: ['**/*.js'],
          dest: 'tmp/public/test/ember_extension'
        }, {
          expand: true,
          cwd: 'test/ember_debug/',
          src: ['**/*.js'],
          dest: 'tmp/public/test/ember_debug'
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
          '!tmp/public/ember_debug.js',
          '!tmp/public/vendor/**'
        ],
        options: {
          jshintrc: '.jshintrc'
        }
      },
      tests: {
        src: [
          'tmp/public/test/**/*.js',
          '!tmp/public/test/vendor/*.js',
        ]
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
      ember_extension_tests: {
        src: ['tmp/public/test/ember_extension/**/*.js'],
        dest: 'tmp/public/ember_extension_test.js'
      },
      ember_debug_tests: {
        src: ['tmp/public/test/ember_debug/**/*.js'],
        dest: 'tmp/public/ember_debug_test.js'
      }
    },
    watch: {
      scripts: {
        files: ['app/**', 'vendor/**', 'ember_debug/**', 'test/**/*', 'css/**/*'],
        tasks: ['build_test']
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
          expand: true,
          cwd: 'test',
          src: ['*.html'],
          dest: 'tmp/public'
        }, {
          expand: true,
          cwd: 'vendor',
          src: ['**'],
          dest: 'tmp/public/vendor'
        },
        {
          src: ['test/test_support.js'],
          dest: 'tmp/public/test/test_support.js'
        }
        ]
      }
    },
    qunit: {
      all:  {
        options: {
          urls: ['http://localhost:9292/ember_extension.html', 'http://localhost:9292/ember_debug.html']
        }
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
    'jshint:all',
    'copy:extension'
  ]);

  grunt.registerTask('build_ember_debug', ['transpile:ember_debug', 'copy:ember_debug', 'concat:ember_debug']);
  grunt.registerTask('server', ['build_test','connect','watch']);

  grunt.registerTask('build_test', ['build', 'transpile:tests', 'copy:tests', 'concat:ember_extension_tests', 'concat:ember_debug_tests', 'jshint:tests']);

  grunt.registerTask('test', ['build_test', 'connect',  'qunit:all']);

  grunt.registerTask('default', ['build']);

};
