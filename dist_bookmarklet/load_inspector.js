(function() {
	"use strict";

	var url = 'http://localhost:9191';

	window.emberInspector = window.open(url, 'ember-inspector');

	if (!window.emberInspector) {
		alert('Unable to open the inspector in a popup.  Please enable popups and retry.');
		return;
	}
	document.documentElement.dataset.emberExtension = 1;

	var script = document.createElement('script');
	script.src = url + '/ember_debug/ember_debug.js';
	document.body.appendChild(script);


}());
