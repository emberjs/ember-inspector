module.exports = function(grunt) {
  let packageJson = grunt.file.readJSON('package.json');
  let versionedPane = `panes-${packageJson.emberVersionsSupported[0].replace(/\./g, '-')}`;
  let config = {
    pkg: packageJson,
    env: process.env,
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
    }
  };

  grunt.initConfig(config);
  grunt.loadNpmTasks('grunt-s3');
};
