module.exports = {
  chrome_ember_debug: {
    src: ['tmp/public/ember_debug.js'],
    dest: 'dist_chrome/ember_debug/ember_debug.js',
    options: {
      wrapper: ['(function(instanceName, adapter) {\n', '\n}("Debug", "chrome"))']
    }
  },
  firefox_ember_debug: {
    src: ['tmp/public/ember_debug.js'],
    dest: 'dist_firefox/data/ember_debug/ember_debug.js',
    options: {
      wrapper: ['(function(instanceName, adapter) {\n', '\n}("Debug", "firefox"))']
    }
  },
  development_ember_debug: {
    src: ['tmp/public/ember_debug.js'],
    dest: 'tmp/public/ember_debug_dev.js',
    options: {
      wrapper: ['(function(instanceName, adapter) {\n', '\n}("DevDebug", "dev"))']
    }
  }
};
