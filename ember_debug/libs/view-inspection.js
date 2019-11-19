const Ember = window.Ember;
const { classify } = Ember.String;

function makeHighlight(id) {
  return `<div id="ember-inspector-highlight-${id}" role="presentation"></div>`;
}

function makeTooltip(id) {
  let prefix = 'ember-inspector-tooltip';

  return `
    <div id="${prefix}-${id}">
      <span class="${prefix}-header">
        <span class="${prefix}-title"></span>
        <span class="${prefix}-category"></span>
      </span>
      <table class="${prefix}-details">
        <tbody>
        </tbody>
      </table>
      <div class="${prefix}-arrow" role="presentation"></div>
    </div>
  `;
}

function makeStylesheet(id) {
  let prefix = 'ember-inspector';

  return `
    #${prefix}-highlight-${id} {
      display: none;
      position: absolute;
      padding: 0px;
      margin: 0px;
      z-index: 10000;
      pointer-events: none;
      /* https://github.com/ChromeDevTools/devtools-frontend/blob/b336f0440a8fb539352ac223ef466c3475618cf1/front_end/common/Color.js#L904 */
      background: rgba(111, 168, 220, .66);
    }

    #${prefix}-tooltip-${id} {
      display: none;
      position: absolute;
      box-sizing: border-box;
      padding: 4px 8px;
      margin: 8px 0px;
      z-index: 10000;
      font-family: sans-serif;
      font-size: 12px;
      background: white;
      box-shadow: 0px 2px 8px 0px rgba(0,0,0,0.25);
      border-radius: 3px;
      pointer-events: none;
    }

    #${prefix}-tooltip-${id} .${prefix}-tooltip-header {
      display: block;
      margin: 4px 0px;
    }

    #${prefix}-tooltip-${id} .${prefix}-tooltip-title {
      font-weight: bold;
    }

    #${prefix}-tooltip-${id} .${prefix}-tooltip-token-tag,
    #${prefix}-tooltip-${id} .${prefix}-tooltip-token-namespace {
      /* https://github.com/ChromeDevTools/devtools-frontend/blob/103326238685ac582d3bf2a02f1627a80e3fce5f/front_end/ui/inspectorSyntaxHighlight.css#L69-L71 */
      color: rgb(168, 148, 166);
    }

    #${prefix}-tooltip-${id} .${prefix}-tooltip-token-name {
      /* https://github.com/ChromeDevTools/devtools-frontend/blob/103326238685ac582d3bf2a02f1627a80e3fce5f/front_end/ui/inspectorSyntaxHighlight.css#L60 */
      color: rgb(136, 18, 128);
    }

    #${prefix}-tooltip-${id} .${prefix}-tooltip-token-id {
      /* https://github.com/ChromeDevTools/devtools-frontend/blob/103326238685ac582d3bf2a02f1627a80e3fce5f/front_end/ui/inspectorSyntaxHighlight.css#L109-L113 */
      color: rgb(26, 26, 166);
    }

    #${prefix}-tooltip-${id} .${prefix}-tooltip-details {
      table-layout: auto;
      width: auto;
      margin: 0px;
      padding: 0px;
      border: none;
      border-spacing: 0;
      border-collapse: collapse;
    }

    #${prefix}-tooltip-${id} .${prefix}-tooltip-details th {
      display: block;
      margin: 4px 8px 4px 0px;
      padding: 0px;
      border: none;
      white-space: nowrap;
      font-weight: normal;
      text-align: left;
      color: #666;
    }

    #${prefix}-tooltip-${id} .${prefix}-tooltip-details td {
      white-space: nowrap;
      margin: 0px;
      padding: 0px;
      border: none;
      text-align: right;
      color: #000;
    }

    #${prefix}-tooltip-${id} .${prefix}-tooltip-arrow {
      position: absolute;
      width: 40px;
      height: 20px;
      left: 0px;
      bottom: -20px;
      overflow: hidden;
    }

    #${prefix}-tooltip-${id} .${prefix}-tooltip-arrow::after {
      content: "";
      position: absolute;
      width: 0px;
      height: 0px;
      top: 0px;
      left: 8px;
      box-sizing: border-box;
      border: 6px solid white;
      border-color: transparent transparent white white;
      transform-origin: 0 0;
      transform: rotate(-45deg);
      box-shadow: 0px 2px 8px 0px rgba(0,0,0,0.25);
      pointer-events: none;
    }
  `;
}

export default class ViewInspection {
  constructor({ renderTree, objectInspector }) {
    this.renderTree = renderTree;
    this.objectInspector = objectInspector;

    this.id = (Math.random() * 100000000).toFixed(0);
    this.isInspecting = false;
    this.lastTarget = null;
    this.lastMatch = null;

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onClick = this.onClick.bind(this);

    this.setup();
  }

  setup() {
    let { id } = this;
    this.highlight = this._insertHTML(makeHighlight(id));
    this.tooltip = this._insertHTML(makeTooltip(id));
    this._insertStylesheet(makeStylesheet(id));
  }

  start() {
    this.isInspecting = true;
    this.lastTarget = null;
    this.lastMatch = null;

    document.body.addEventListener('mousemove', this.onMouseMove);
  }

  stop() {
    this.hide();

    this.isInspecting = false;
    this.lastTarget = null;
    this.lastMatchId = null;

    document.body.removeEventListener('mousemove', this.onMouseMove);
  }

  onMouseMove({ target }) {
    this.inspectNearest(target, false);
  }

  onClick({ target }) {

  }

  inspectNearest(target, pin = true) {
    let { isInspecting, lastTarget, lastMatchId } = this;

    if (isInspecting && target === lastTarget) {
      return this.renderTree.find(lastMatchId);
    }

    let match = this.renderTree.findNearest(target, lastMatchId);

    if (match) {
      this.show(match.id, pin);
    } else {
      this.hide();
    }

    if (isInspecting) {
      this.lastTarget = target;
      this.lastMatchId = match && match.id;
    }

    return match;
  }

  show(id, pin = true) {
    let node = this.renderTree.find(id);
    let rect = this.renderTree.getBoundingClientRect(id);

    if (node && rect) {
      this._showHighlight(node, rect);
      this._showTooltip(node, rect);
    } else {
      this.hide();
    }
  }

  hide() {
    this._hideHighlight();
    this._hideTooltip();
  }

  _showHighlight(_node, rect) {
    let { style } = this.highlight;
    let { top, left, width, height } = rect;
    let { scrollX, scrollY } = window;

    style.display = 'block';
    style.top = `${top + scrollY}px`;
    style.left = `${left + scrollX}px`;
    style.width = `${width}px`;
    style.height = `${height}px`;
    style.pointerEvents = 'none';
  }

  _hideHighlight() {
    this.highlight.style.display = 'none';
  }

  _showTooltip(node, rect) {
    this._renderTooltipTitle(node);
    this._renderTooltipCategory(node);
    this._renderTooltipDetails(node);

    let { style } = this.tooltip;
    let { top, left } = rect;
    let { scrollX, scrollY } = window;

    style.display = 'block';
    style.top = 'auto';
    style.bottom = 'auto';
    style.left = 'auto';
    style.right = 'auto';
    style.pointerEvents = 'none';

    let { height } = this.tooltip.getBoundingClientRect();

    style.top = `${top + scrollY - height - 16}px`;
    style.left = `${left + scrollX}px`;
  }

  _hideTooltip() {
    this.tooltip.style.display = 'none';
  }

  _renderTooltipTitle(node) {
    let title = this.tooltip.querySelector('.ember-inspector-tooltip-title');

    title.innerHTML = '';

    if (node.type === 'component') {
      this._renderTokens(title, this._tokenizeComponentNode(node));
    } else if (node.type === 'outlet') {
      this._renderTokens(title, [['tag', '{{'], ['name', 'outlet'], ['tag', ' '], ['tag', '"'], ['id', node.name], ['tag', '"'], ['tag', '}}']]);
    } else if (node.type === 'engine') {
      this._renderTokens(title, [['tag', '{{'], ['name', 'mount'], ['tag', ' '], ['tag', '"'], ['id', node.name], ['tag', '"'], ['tag', '}}']]);
    } else {
      title.innerText = node.name;
    }
  }

  _renderTooltipCategory(node) {
    let category = this.tooltip.querySelector('.ember-inspector-tooltip-category');

    switch (node.type) {
      case 'component':
      case 'outlet':
      case 'engine':
        category.innerHTML = '';
        break;

      case 'route-template':
        category.innerText = 'route';
        break;
    }
  }

  _renderTooltipDetails(node) {
    let tbody = this.tooltip.querySelector('.ember-inspector-tooltip-details tbody');

    tbody.innerHTML = '';

    if (node.template) {
      this._renderTooltipDetail(tbody, 'Template', node.template);
    }

    if (node.instance) {
      if (node.type === 'route-template') {
        this._renderTooltipDetail(tbody, 'Controller', this._tokenizeItem(node.instance));
      } else {
        this._renderTooltipDetail(tbody, 'Instance', this._tokenizeItem(node.instance));
      }
    }
  }

  _renderTooltipDetail(tbody, key, value) {
    let tr = document.createElement('tr');
    let th = document.createElement('th');
    let td = document.createElement('td');

    th.innerText = key;

    if (Array.isArray(value)) {
      this._renderTokens(td, value);
    } else {
      td.innerText = value;
    }

    tr.appendChild(th);
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  _renderTokens(parent, tokens) {
    for(let [type, value] of tokens) {
      let span = document.createElement('span');
      span.innerText = value;
      span.setAttribute('class', `ember-inspector-tooltip-token-${type}`);
      parent.appendChild(span);
    }
  }

  _tokenizeComponentNode(node) {
    let useAngleBracket = node.args.positional.length === 0;
    let parts = node.name.split('/');

    if (useAngleBracket) {
      parts = parts.map(classify);
    }

    let name = parts.pop();
    let namespace = parts;

    let tokens = [];

    if (useAngleBracket) {
      tokens.push(['tag', '<']);
    } else {
      tokens.push(['tag', '{{']);
    }

    while (namespace.length > 0) {
      tokens.push(['namespace', namespace.shift()]);
      tokens.push(['tag', '::']);
    }

    tokens.push(['name', name]);

    if (useAngleBracket) {
      tokens.push(['tag', '>']);
    } else {
      tokens.push(['tag', '}}']);
    }

    return tokens;
  }

  _tokenizeItem(item) {
    switch (typeof item) {
      case 'string':
      case 'number':
      case 'bigint':
      case 'boolean':
      case 'undefined':
        return [['id', `${item}`]];
    }

    if (item === null) {
      return [['id', 'null']];
    }

    return this._tokenizeObject(item);
  }

  _tokenizeObject(item) {
    let object = this.objectInspector.sentObjects[item.id];
    let stringified;

    try {
      stringified = String(object);
    } catch {
      // nope!
    }

    if (!object || !stringified) {
      return [['tag', '(unknown)']];
    }

    {
      // <my-app@component:foo-bar::ember123>
      let match = stringified.match(/<([a-z0-9-_]+)@([a-z0-9-_]+):([a-z0-9-_]+)::([a-z0-9-_]+)>/i);

      if (match) {
        return [
          ['tag', '<'],
          ['namespace', match[1]],
          ['tag', '@'],
          ['namespace', match[2]],
          ['tag', ':'],
          ['name', match[3]],
          ['tag', '::'],
          ['id', match[4]],
          ['tag', '>']
        ];
      }
    }

    // TODO: support other ember object strings, `[object Object]`, `Symbol(hi)` etc
    return [['tag', stringified]];
  }

  _insertHTML(html) {
    document.body.insertAdjacentHTML('beforeend', html.trim());
    return document.body.lastChild;
  }

  _insertStylesheet(content) {
    let style = document.createElement('style');
    style.appendChild(document.createTextNode(content));
    document.head.appendChild(style);
  }
}
