module.exports = {
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
};
