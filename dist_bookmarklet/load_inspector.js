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
	var windowUrl = url + '/panes/index.html' + '?inspectedWindowURL=' + locationOrigin();
	var inspectorWindow;

	var pathArray = url.split( '/' );
	var base = pathArray[0] + '//' + pathArray[2];

  if (!supportsPopup()) {
		var iframe = document.createElement('iframe');
		iframe.width = '100%';
		iframe.height = '300';
		iframe.style.backgroundColor = 'white';
		iframe.style.position = 'absolute';
		iframe.style.bottom = '0';
		iframe.style.right = '0';
		iframe.style.zIndex = 100000;
		iframe.src = windowUrl;
		document.body.appendChild(iframe);
		inspectorWindow = iframe.contentWindow;
	} else {
		inspectorWindow = window.open(encodeURI(windowUrl), 'ember-inspector');
	}

	window.emberInspector = {
		w: inspectorWindow,
		url: base
	};


	if (!window.emberInspector) {
		alert('Unable to open the inspector in a popup.  Please enable popups and retry.');
		return;
	}
	document.documentElement.dataset.emberExtension = 1;

	var script = document.createElement('script');
	script.src = url + '/ember_debug/ember_debug.js';
	document.body.appendChild(script);


	function locationOrigin() {
		var origin = window.location.origin;
		if (!origin) {
			origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
		}
		return origin;
	}

	function supportsPopup() {
		return !isIE();
	}

	function isIE() {
		return ((navigator.appName == 'Microsoft Internet Explorer') || ((navigator.appName == 'Netscape') && (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null)));
	}
}());
