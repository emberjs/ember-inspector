import TabRoute from "ember-inspector/routes/tab";

export default TabRoute.extend({
  model() {
    return [];
  },

  setupController() {
    this._super(...arguments);
    this.get('port').on('view:viewTree', this, this.setViewTree);
    this.get('port').on('view:stopInspecting', this, this.stopInspecting);
    this.get('port').on('view:startInspecting', this, this.startInspecting);
    this.get('port').on('view:inspectDOMElement', this, this.inspectDOMElement);
    this.get('port').send('view:getTree');
  },

  deactivate() {
    this.get('port').off('view:viewTree', this, this.setViewTree);
    this.get('port').off('view:stopInspecting', this, this.stopInspecting);
    this.get('port').off('view:startInspecting', this, this.startInspecting);
    this.get('port').off('view:inspectDOMElement', this, this.inspectDOMElement);
  },

  setViewTree(options) {
    this.set('controller.viewTree', options.tree);
  },

  startInspecting() {
    this.set('controller.inspectingViews', true);
  },

  stopInspecting() {
    this.set('controller.inspectingViews', false);
  },

  inspectDOMElement({ elementSelector }) {
    this.get('port.adapter').inspectDOMElement(elementSelector);
  }
});
