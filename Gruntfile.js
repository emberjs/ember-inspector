module.exports = function(grunt) {

  var config = {
    pkg: grunt.file.readJSON('package.json'),
    env: process.env,
    "mozilla-cfx-xpi": {
      "stable": {
        options: {
          "mozilla-addon-sdk": "latest",
          extension_dir: "dist/firefox",
          dist_dir: "tmp/xpi"
        }
      }
    },
    "mozilla-addon-sdk": {
      "latest": {
        options: {
          revision: "latest",
          dest_dir: "tmp/mozilla-addon-sdk"
        }
      }
    },
    "mozilla-cfx": {
      "run": {
        options: {
          "mozilla-addon-sdk": "latest",
          extension_dir: "dist/firefox",
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
        src: ['skeleton_chrome/manifest.json', 'skeleton_firefox/package.json']
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
          src: 'dist/bookmarklet/**/*.*',
          dest: 'dist_bookmarklet/',
          rel: 'dist/bookmarklet',
          options: { verify: true }
        }]
      }
    },
    "compress": {
      main: {
        options: {
          archive: 'dist/chrome/ember-inspector.zip'
        },
        expand: true,
        pretty: true,
        src: 'dist/chrome/**/*'
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

  grunt.registerTask('clean-tmp', function() {
    grunt.file.delete('./tmp');
  });
};
