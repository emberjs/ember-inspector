// This script runs at document_start, avoid adding more stuff here!

// TODO: make this conditional, only do it when requested.

let id = `ember-inspector-boot-${(Math.random() * 100000000).toFixed(0)}`;

let script = document.createElement('script');

script.setAttribute('id', id);

script.appendChild(document.createTextNode(`
  window.EmberENV = { _DEBUG_RENDER_TREE: true };
  document.getElementById(${JSON.stringify(id)}).remove();
`));

document.documentElement.appendChild(script);
