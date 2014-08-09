(function() {
	"use strict";


	function getScriptURL() {
    var scripts = document.getElementsByTagName('script');
		if (scripts && scripts.length) {
			for (var i = 0; i < scripts.length; i++) {
				if (scripts[i].src && scripts[i].src.match(/load_inspector.js$/)) {
					return scripts[i].src.replace(/\/load_inspector.js$/, '');
				}
			}
		}
		return null;
	}

	var url = getScriptURL();

	window.emberInspector = {
		w: window.open(encodeURI(url + '?inspectedWindowURL=' + window.location.origin), 'ember-inspector'),
		url: url
	};

	if (!window.emberInspector) {
		alert('Unable to open the inspector in a popup.  Please enable popups and retry.');
		return;
	}
	document.documentElement.dataset.emberExtension = 1;

	var script = document.createElement('script');
	script.src = url + '/ember_debug/ember_debug.js';
	document.body.appendChild(script);


}());
