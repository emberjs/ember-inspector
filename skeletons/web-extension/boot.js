// This script runs at document_start, avoid adding more stuff here!

// TODO: make this conditional, only do it when requested.
// only inject boot script when on an HTML page
if (document.contentType === 'text/html') {
  let script = document.createElement('script');

  script.src = chrome.runtime.getURL('scripts/boot.js');

  document.documentElement.appendChild(script);
}
