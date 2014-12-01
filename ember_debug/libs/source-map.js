/**
 * Used to map a stack trace to its original sources.
 * A lot of the code is inspired by/taken from
 * https://github.com/evanw/node-source-map-support
 */
var Ember = window.Ember;
var EmberObject = Ember.Object;
export default EmberObject.extend({

  map: function(stack) {
    var self = this;
    var parsed = fromStackProperty(stack);
    return Ember.A(parsed).map(function(item) {
      var smc = self.getSourceMap(item.url);
      var source = smc.originalPositionFor({
        line: item.line,
        column: item.column
      });
      source.fullSource = relativeToAbsolute(item.url, source.source);
      return source;
    });
  },

  sourceMapCache: function() {
    return {};
  }.property(),

  getSourceMap: function(url) {
    var sourceMaps = this.get('sourceMapCache');
    if (sourceMaps[url]) { return sourceMaps[url]; }
    var map = JSON.parse(retrieveSourceMap(url).map);
    var sm = new window.sourceMap.SourceMapConsumer(map);
    sourceMaps[url] = sm;
    return sm;
  }
});


function retrieveSourceMap(source) {
  var sourceMappingURL = retrieveSourceMapURL(source);
  if (!sourceMappingURL) { return null;}

  // Read the contents of the source map
  var sourceMapData;
  // Support source map URLs relative to the source URL
  sourceMappingURL = relativeToAbsolute(source, sourceMappingURL);
  sourceMapData = retrieveFile(sourceMappingURL, 'utf8');

  if (!sourceMapData) {
    return null;
  }

  return {
    url: sourceMappingURL,
    map: sourceMapData
  };
}

function relativeToAbsolute(file, url) {
  if (!file) { return url; }
  var dir = file.split('/');
  dir.pop();
  dir.push(url);
  return dir.join('/');
}

function retrieveFile(source) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', source, false);
  xhr.send(null);
  return xhr.readyState === 4 ? xhr.responseText : null;
}

function retrieveSourceMapURL(source) {
  var fileData = retrieveFile(source);

  var match = /\/\/[#@]\s*sourceMappingURL=(.*)\s*$/m.exec(fileData);
  if (!match) { return null; }
  return match[1];
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

	return stack.length ? stack:null;
}
