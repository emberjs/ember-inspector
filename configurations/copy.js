module.exports = {
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
      dest: 'extension_dist/ember_debug/ember_debug.js'
    }, {
      src: ['tmp/public/ember_extension.js'],
      dest: 'extension_dist/panes/ember_extension.js'
    }, {
      expand: true,
      cwd: 'vendor',
      src: ['**'],
      dest: 'extension_dist/vendor/'
    }, {
      src: ['tmp/public/ember_extension.css'],
      dest: 'extension_dist/panes/ember_extension.css'
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
