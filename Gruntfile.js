module.exports = function(grunt) {

  var config = {
    pkg: grunt.file.readJSON('package.json'),
    env: process.env,
    "mozilla-cfx-xpi": {
      "stable": {
        options: {
          "mozilla-addon-sdk": "1_15",
          extension_dir: "dist_firefox",
          dist_dir: "tmp/xpi"
        }
      }
    },
    "mozilla-addon-sdk": {
      "1_15": {
        options: {
          revision: "1.15",
          dest_dir: ".mozilla-addon-sdk"
        }
      }
    },
    "mozilla-cfx": {
      "run": {
        options: {
          "mozilla-addon-sdk": "1_15",
          extension_dir: "dist_firefox",
          command: "run"
        }
      }
    },
    "version": {
      app: {
        src: ['app/app.js']
      },
      dist: {
        prefix: '^"?version"?:\s*[\'"]?',
        src: ['dist_chrome/manifest.json', 'dist_firefox/package.json']
      }
    },
    "s3": {
      options: {
        bucket: 'ember-extension',
        access: 'public-read',
        headers: {
          // One day cache policy (1000 * 60 * 60 * 24)
          "Cache-Control": "max-age=86400000, public"
        }
      },
      bookmarklet: {
        sync: [{
          src: 'dist_bookmarklet/**/*.*',
          dest: 'dist_bookmarklet/',
          rel: 'dist_bookmarklet',
          options: { verify: true }
        }]
      }
    },
    "compress": {
      main: {
        options: {
          archive: 'dist_chrome/ember-inspector.zip'
        },
        expand: true,
        pretty: true,
        src: 'dist_chrome/**/*'
      }
    }
  };

  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-mozilla-addon-sdk');
  grunt.loadNpmTasks('grunt-version');
  grunt.loadNpmTasks('grunt-s3');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('build-xpi', [
    'mozilla-addon-sdk',
    'mozilla-cfx-xpi'
  ]);

  grunt.registerTask('run-xpi', ['build-xpi', 'mozilla-cfx:run']);

};
