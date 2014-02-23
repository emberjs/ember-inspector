module.exports = {
  app: {
    src: ['app/app.js']
  },
  dist: {
    prefix: '^"?version"?:\s*[\'"]?',
    src: ['dist_chrome/manifest.json', 'dist_firefox/package.json']
  }
};
