module.exports = {
  chrome_ember_debug: {
    src: ['tmp/public/ember_debug.js'],
    dest: 'dist_chrome/ember_debug/ember_debug.js',
    options: {
      wrapper: ['(function(adapter) {\n', '\n}("chrome"))']
    }
  },
  firefox_ember_debug: {
    src: ['tmp/public/ember_debug.js'],
    dest: 'dist_firefox/data/ember_debug/ember_debug.js',
    options: {
      wrapper: ['(function(adapter) {\n', '\n}("firefox"))']
    }
  },
  bookmarklet_ember_debug: {
    src: ['tmp/public/ember_debug.js'],
    dest: 'dist_bookmarklet/ember_debug/ember_debug.js',
    options: {
      wrapper: ['(function(adapter) {\n', '\n}("bookmarklet"))']
    }
  },
  websocket_ember_debug: {
    src: ['tmp/public/ember_debug.js'],
    dest: 'dist_websocket/ember_debug/ember_debug.js',
    options: {
      wrapper: ['(function(adapter) {\n', '\n}("websocket"))']
    }
  }
};
