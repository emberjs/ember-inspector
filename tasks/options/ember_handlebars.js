module.exports = {
  compile: {
    options: {
      processName: function(filename) {
        return filename.replace(/app\/templates\//,'').replace(/\.handlebars$/,'');
      }
    },
    files: {
      "tmp/public/ember_extension/templates.js": "app/templates/**/*.handlebars"
    }
  }
};
