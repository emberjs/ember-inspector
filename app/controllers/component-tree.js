import { on } from '@ember/object/evented';
import EmberObject, { observer, get, computed } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import searchMatch from 'ember-inspector/utils/search-match';
import { filter, reads } from '@ember/object/computed';

let ComponentViewItem = EmberObject.extend({
  view: null,
  parent: null,
  parentCount: 0,
  expanded: true,
  hasChildren: true,

  id: reads('view.objectId'),
  visible: computed('parent.{visible,expanded}', function() {
    let parent = this.get('parent');
    if (!parent) { return true; }
    return parent.get('expanded') && parent.get('visible');
  }),
});

const flattenTree = (treeNode, parent, parentCount, list) => {
  let viewItem = ComponentViewItem.create({
    view: treeNode.value,
    parent,
    parentCount,
    hasChildren: treeNode.children.length > 0,
  });
  list.push(viewItem);
  treeNode.children.forEach(child => {
    flattenTree(child, viewItem, parentCount + 1, list);
  });
  return list;
};

export default Controller.extend({
  application: controller(),
  pinnedObjectId: null,
  inspectingViews: false,
  components: true,
  options: {
    components: true,
  },

  /**
   * Bound to the search field to filter the component list.
   *
   * @property searchText
   * @type {String}
   * @default ''
   */
  searchText: '',

  /**
   * The filtered view list.
   *
   * @property filteredList
   * @type {Array<Object>}
   */
  filteredList: filter('viewArray', function(item) {
    // return searchMatch(get(item, 'view.name'), this.get('searchText'));
    return item.get('visible');
  }).property('viewArray.@each.visible', 'searchText'),

  viewArray: computed('viewTree', function() {
    let tree = this.get('viewTree');
    if (!tree) { return []; }
    return flattenTree(tree, null, 0, []);
  }),

  init() {
    this._super(...arguments);
    this.port.send('view:setOptions', { options: this.get('options') });
  },

  optionsChanged: on(
    'init',
    observer('options.components', function() {
      this.port.send('view:setOptions', { options: this.get('options') });
    })
  ),

  actions: {
    previewLayer({ view: { objectId, elementId, renderNodeId } }) {
      // We are passing all of objectId, elementId, and renderNodeId to support post-glimmer 1, post-glimmer 2, and root for
      // post-glimmer 2
      this.get('port').send('view:previewLayer', {
        objectId,
        renderNodeId,
        elementId,
      });
    },

    hidePreview() {
      this.get('port').send('view:hidePreview');
    },

    toggleViewInspection() {
      this.get('port').send('view:inspectViews', {
        inspect: !this.get('inspectingViews'),
      });
    },

    sendObjectToConsole(objectId) {
      this.get('port').send('objectInspector:sendToConsole', { objectId });
    },

    inspect(objectId) {
      if (objectId) {
        this.set('pinnedObjectId', objectId);
        this.get('port').send('objectInspector:inspectById', { objectId });
      }
    },

    inspectElement({ objectId, elementId }) {
      this.get('port').send('view:inspectElement', { objectId, elementId });
    },
  },
});
