module.exports = function(grunt) {

  var config = {
    pkg: grunt.file.readJSON('package.json'),
    env: process.env,
    "jpm": {
      options: {
        src: "dist/firefox",
        xpi: "tmp/xpi"
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

  grunt.loadNpmTasks('grunt-jpm');
  grunt.loadNpmTasks('grunt-version');
  grunt.loadNpmTasks('grunt-s3');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('build-xpi', ['jpm:xpi']);

  grunt.registerTask('run-xpi', ['jpm:run']);

  grunt.registerTask('clean-tmp', function() {
    grunt.file.delete('./tmp');
  });
};
