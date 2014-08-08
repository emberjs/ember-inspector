module.exports = {
  ember_debug: {
    files: [{
      expand: true,
      cwd: 'ember_debug/vendor',
      src: ['**'],
      dest: 'tmp/public/ember_debug/vendor'
    }]
  },
  chrome_extension: {
    files: [{
      src: ['tmp/public/ember_extension.js'],
      dest: 'dist_chrome/panes/ember_extension.js'
    }, {
      expand: true,
      cwd: 'vendor',
      src: ['**'],
      dest: 'dist_chrome/vendor/'
    }, {
      src: ['tmp/public/ember_extension.css'],
      dest: 'dist_chrome/panes/ember_extension.css'
    }, {
      expand: true,
      cwd: 'dist_common/images',
      src: ['**'],
      dest: 'dist_chrome/images'
    }, {
      src: ['dist_common/in-page-script.js'],
      dest: 'dist_chrome/in-page-script.js'
    }]
  },
  firefox_extension: {
    files: [{
      src: ['tmp/public/ember_extension.js'],
      dest: 'dist_firefox/data/panes/ember_extension.js'
    }, {
      expand: true,
      cwd: 'vendor',
      src: ['**'],
      dest: 'dist_firefox/data/vendor/'
    }, {
      expand: true,
      cwd: 'dist_common/images',
      src: ['**'],
      dest: 'dist_firefox/data/images/'
    }, {
      src: ['tmp/public/ember_extension.css'],
      dest: 'dist_firefox/data/panes/ember_extension.css'
    }, {
      src: ['dist_common/in-page-script.js'],
      dest: 'dist_firefox/data/in-page-script.js'
    }]
  },
  bookmarklet_extension: {
    files: [{
      src: ['tmp/public/ember_extension.js'],
      dest: 'dist_bookmarklet/ember_extension.js'
    }, {
      expand: true,
      cwd: 'vendor',
      src: ['**'],
      dest: 'dist_bookmarklet/vendor/'
    }, {
      expand: true,
      cwd: 'dist_common/images',
      src: ['**'],
      dest: 'dist_bookmarklet/images/'
    }, {
      src: ['tmp/public/ember_extension.css'],
      dest: 'dist_bookmarklet/ember_extension.css'
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
};
