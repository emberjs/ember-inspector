import { htmlSafe } from '@ember/template';

const SVGS = import.meta.glob('../svg/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const ROOT_TAG = /^\s*<svg\b([^>]*)>/;
const ATTRIBUTE = /([\w:-]+)="([^"]*)"/g;

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/**
 * Inlines `app/svg/<name>.svg`.
 * Named arguments become attributes of the root `<svg>`,
 * and replace the attributes of the file with the same name.
 *
 *   {{svgJar "reload" width="16px" height="16px" class="icon"}}
 */
export default function svgJar(name, attributes = {}) {
  let svg = SVGS[`../svg/${name}.svg`];

  if (!svg) {
    console.warn(`svgJar: there is no app/svg/${name}.svg`);
    return;
  }

  let [rootTag, rootAttributes] = svg.match(ROOT_TAG);
  let merged = {};

  for (let [, key, value] of rootAttributes.matchAll(ATTRIBUTE)) {
    merged[key] = value;
  }

  for (let [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null) continue;

    merged[key] = escapeAttribute(value);
  }

  let attributeText = '';

  for (let [key, value] of Object.entries(merged)) {
    attributeText += ` ${key}="${value}"`;
  }

  return htmlSafe(`<svg${attributeText}>` + svg.slice(rootTag.length));
}
