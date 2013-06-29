module.exports = {
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
};
