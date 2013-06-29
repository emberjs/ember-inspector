module.exports = {
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
};
