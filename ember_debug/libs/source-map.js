/**
 * Used to map a stack trace to its original sources.
 * A lot of the code is inspired by/taken from
 * https://github.com/evanw/node-source-map-support
 */
var Ember = window.Ember;
var EmberObject = Ember.Object;
var computed = Ember.computed;
var RSVP = Ember.RSVP;
var resolve = RSVP.resolve;

var notFoundError = new Error('Source map url not found');

export default EmberObject.extend({

  _lastPromise: computed(function() {
    return resolve();
  }),

  /**
   * Returns a promise that resolves to an array
   * of mapped sourcew.
   *
   * @param  {String} stack The stack trace
   * @return {RSVP.Promise}
   */
  map: function(stack) {
    var self = this;
    var parsed = Ember.A(fromStackProperty(stack));
    var array = Ember.A();
    var lastPromise = null;
    parsed.forEach(function(item) {
      lastPromise = self.get('_lastPromise').then(function() {
        return self.getSourceMap(item.url);
      }).then(function(smc) {
        if (smc) {
          var source = smc.originalPositionFor({
            line: item.line,
            column: item.column
          });
          source.fullSource = relativeToAbsolute(item.url, source.source);
          array.push(source);
          return array;
        }
      });
      self.set('_lastPromise', lastPromise);
    });
    return resolve(lastPromise).catch(function(e) {
      if (e === notFoundError) {
        return null;
      }
      throw e;
    });
  },

  sourceMapCache: computed(function() {
    return {};
  }),

  getSourceMap: function(url) {
    var sourceMaps = this.get('sourceMapCache');
    if (sourceMaps[url] !== undefined) { return resolve(sourceMaps[url]); }
    return retrieveSourceMap(url).then(function(response) {
      if (response) {
        var map = JSON.parse(response.map);
        var sm = new window.sourceMap.SourceMapConsumer(map);
        sourceMaps[url] = sm;
        return sm;
      }
    }, function() {
      sourceMaps[url] = null;
    });
  }
});


function retrieveSourceMap(source) {
  var mapURL;
  return retrieveSourceMapURL(source).then(function(sourceMappingURL) {
    if (!sourceMappingURL) {
      throw notFoundError;
    }

    // Support source map URLs relative to the source URL
    mapURL = relativeToAbsolute(source, sourceMappingURL);
    return mapURL;
  })
  .then(retrieveFile)
  .then(function(sourceMapData) {
    if (!sourceMapData) {
      return null;
    }
    return {
      url: mapURL,
      map: sourceMapData
    };
  });
}

function relativeToAbsolute(file, url) {
  if (!file) { return url; }
  var dir = file.split('/');
  dir.pop();
  dir.push(url);
  return dir.join('/');
}

function retrieveFile(source) {
  return new RSVP.Promise(function(resolve) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      resolve(this.responseText);
    };
    xhr.open('GET', source, true);
    xhr.send();
  });
}

function retrieveSourceMapURL(source) {
  return retrieveFile(source).then(function(fileData) {
    var match = /\/\/[#@]\s*sourceMappingURL=(.*)\s*$/m.exec(fileData);
    if (!match) { return null; }
    return match[1];
  });
}


var UNKNOWN_FUNCTION = "<unknown>";

// Taken from https://github.com/errorception/browser-stack-parser/
function fromStackProperty(stackString) {
  var chrome = /^\s*at (?:((?:\[object object\])?\S+(?: \[as \S+\])?) )?\(?((?:file|http|https):.*?):(\d+)(?::(\d+))?\)?\s*$/i,
      gecko = /^\s*(\S*)(?:\((.*?)\))?@((?:file|http|https).*?):(\d+)(?::(\d+))?\s*$/i,
      lines = stackString.split('\n'),
      stack = [],
      parts;

  for (var i = 0, j = lines.length; i < j; ++i) {
    if ((parts = gecko.exec(lines[i]))) {
      stack.push({
        url: parts[3],
        func: parts[1] || UNKNOWN_FUNCTION,
        args: parts[2] ? parts[2].split(',') : '',
        line: +parts[4],
        column: parts[5] ? +parts[5] : null
      });
    } else if ((parts = chrome.exec(lines[i]))) {
      stack.push({
        url: parts[2],
        func: parts[1] || UNKNOWN_FUNCTION,
        line: +parts[3],
        column: parts[4] ? +parts[4] : null
      });
    }
  }

  return stack.length ? stack : null;
}
