import {
  get,
  computed
} from '@ember/object';
import Controller, {
  inject as controller
} from '@ember/controller';
import searchMatch from 'ember-inspector/utils/search-match';
import {
  notEmpty,
} from '@ember/object/computed';
import {
  isEmpty
} from '@ember/utils';

import {
  schedule
} from '@ember/runloop';

import ComponentViewItem from 'ember-inspector/models/component-view-item';

/**
 * Takes the `viewTree` from `view-debug`'s `sendTree()` method, and recursively
 * flattens it into an array of `ComponentViewItem` objects
 * @param {string} searchValue The value of the search box
 * @param {*} treeNode The node in the viewTree
 * @param {ComponentViewItem} parent The parent `ComponentViewItem`
 * @param {number} parentCount The component hierarchy depth
 * @param {boolean} parentMatched Whether the parent node is initially set to display
 * @param {Array<ComponentViewItem>} list The accumulator, gets mutated in each call
 */
const flattenSearchTree = (
  searchValue,
  treeNode,
  parent,
  parentCount,
  parentMatched,
  list
) => {
  let activeSearch = !isEmpty(searchValue);
  let searchMatched = activeSearch ?
    searchMatch(get(treeNode, 'value.name'), searchValue) :
    true;

  let viewItem = ComponentViewItem.create({
    view: treeNode.value,
    parent,
    parentCount,
    searchMatched,
    activeSearch,
    expanded: !activeSearch,
    hasChildren: treeNode.children.length > 0,
  });

  // remember if there is no active search, searchMatched will be true
  let shouldAddItem = searchMatched || parentMatched;
  if (shouldAddItem) {
    list.push(viewItem);
  }

  let newParentCount = shouldAddItem ? parentCount + 1 : 0;

  treeNode.children.forEach(child => {
    flattenSearchTree(
      searchValue,
      child,
      viewItem,
      newParentCount,
      shouldAddItem,
      list
    );
  });
  return list;
};

export default Controller.extend({
  application: controller(),
  queryParams: ['pinnedObjectId'],

  /**
   * The entry in the component tree corresponding to the pinnedObjectId
   * will be selected
   */
  pinnedObjectId: null,
  inspectingViews: false,
  components: true,
  options: {
    components: true,
  },
  viewTreeLoaded: false,

  /**
   * Bound to the search field to filter the component list.
   *
   * @property searchValue
   * @type {String}
   * @default ''
   */
  searchValue: '',

  activeSearch: notEmpty('searchValue'),

  /**
   * The final list that the `{{vertical-collection}}` renders
   * is created in three stages:
   * 1. The `viewArray` is recalculated When the controller's `viewTree` is set by the route, or when
   *    a user updates the search box.
   * 2. The `filteredArray` CP takes the `viewArray` and caches the expanded state for each item.
   *    This keeps the tree from suddenly re-expanding if the `viewTree` updates after users have
   *    collapsed some nodes.
   * 3. Once the list is rendered, when users expand/collapse a node that action directly
   *    toggles the `expanded` property on each item, which makes `visible` recompute.
   *
   * This could probably happen in one big function, but for the time being its split in the
   * interest of clarity rather than performance (even if the extra CPs might avoid doing some extra
   * work when users expand/contract tree nodes)
   */
  displayedList: computed('filteredArray.@each.visible', function () {
    return this.get('filteredArray').filterBy('visible');
  }),

  filteredArray: computed('viewArray.[]', function () {
    let viewArray = this.get('viewArray');
    let expandedStateCache = this.get('expandedStateCache');
    viewArray.forEach(viewItem => {
      let cachedExpansion = expandedStateCache[viewItem.view.objectId];
      if (cachedExpansion !== undefined) {
        viewItem.set('expanded', cachedExpansion);
      } else {
        expandedStateCache[viewItem.view.objectId] = viewItem.expanded;
      }
    });

    return viewArray;
  }),

  viewArray: computed('viewTree', 'searchValue', function () {
    let tree = this.get('viewTree');
    if (!tree) {
      return [];
    }
    return flattenSearchTree(this.get('searchValue'), tree, null, 0, false, []);
  }),

  expandedStateCache: null, //set on init

  init() {
    this._super(...arguments);
    this.set('expandedStateCache', {});
  },

  /**
   * Expands the component tree so that entry for the given view will
   * be shown.  Recursively expands the entry's parents up to the root.
   * @param {*} objectId The id of the ember view to show
   */
  expandToNode(objectId) {
    let node = this.get('filteredArray').find(item => item.get('id') === objectId);
    if (node) {
      node.expandParents();
    }
  },

  /**
   * This method is basically a trick to get the `{{vertical-collection}}` in the vicinity
   * of the item that's been selected.  We can't directly scroll to the element but we
   * can guess at how far down the list the item is. Then we can manually set the scrollTop
   * of the virtual scroll.
   */
  scrollTreeToItem(objectId) {
    let selectedItemIndex = this.get('displayedList').findIndex(item => item.view.objectId === objectId);

    if (!selectedItemIndex) {
      return;
    }

    const averageItemHeight = 25;
    const targetScrollTop = averageItemHeight * selectedItemIndex;
    const componentTreeEl = document.querySelector('.js-component-tree');
    const height = componentTreeEl.offsetHeight;

    // Only scroll to item if not already in view
    if (targetScrollTop < componentTreeEl.scrollTop || targetScrollTop > componentTreeEl.scrollTop + height) {
      schedule('afterRender', () => {
        componentTreeEl.scrollTop = targetScrollTop - (height / 2);
      });
    }
  },


  actions: {
    previewLayer({
      view: {
        objectId,
        elementId,
        renderNodeId
      }
    }) {
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
      this.get('port').send('objectInspector:sendToConsole', {
        objectId,
      });
    },

    /**
     * Expand or collapse all component nodes
     * @param {Boolean} expanded If true, expanded, if false, collapsed
     */
    expandOrCollapseAll(expanded) {
      this.expandedStateCache = {};
      this.get('filteredArray').forEach((item) => {
        item.set('expanded', expanded);
        this.expandedStateCache[item.view.objectId] = expanded;
      });
    },

    toggleExpanded(item) {
      item.toggleProperty('expanded');
      this.expandedStateCache[item.view.objectId] = item.get('expanded');
    },

    inspect(objectId) {
      if (objectId) {
        this.set('pinnedObjectId', objectId);
        this.expandToNode(objectId);
        this.scrollTreeToItem(objectId);
        this.get('port').send('objectInspector:inspectById', {
          objectId,
        });
      }
    },

    /**
     * Scrolls the main page to put the selected element into view
     */
    scrollToElement(elementId) {
      this.get('port').send('view:scrollToElement', {
        elementId
      });
    },

    inspectElement({
      objectId,
      elementId
    }) {
      this.get('port').send('view:inspectElement', {
        objectId,
        elementId,
      });
    },
  },
});
