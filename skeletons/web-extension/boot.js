// This script runs at document_start, avoid adding more stuff here!

// TODO: make this conditional, only do it when requested.
// only inject boot script when on an HTML page
if (document.contentType === 'text/html') {
  window.EmberENV = { _DEBUG_RENDER_TREE: true };

  // for firefox
  //https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts
  if (window.wrappedJSObject) {
    const EmberENV = new window.Object();
    EmberENV._DEBUG_RENDER_TREE = true
    window.wrappedJSObject.EmberENV = EmberENV;
  }
}
