var grunt = require('grunt');

module.exports = {
  options: {
    templateBasePath: /app\//,
    templateFileExtensions: /\.(hbs|hjs|handlebars)/,
    templateRegistration: function(name, template) {
      return "define('" + name + "', ['exports'], function(__exports__){ __exports__['default'] = " + template + "; });";
    }
  },
  dist: {
    src: "app/**/*.{hbs,hjs,handlebars}",
    dest: "tmp/public/ember_extension/templates.js"
  }
};
