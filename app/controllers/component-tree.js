import {
  action,
  get,
  computed
} from '@ember/object';
import Controller, {
  inject as controller
} from '@ember/controller';
import searchMatch from 'ember-inspector/utils/search-match';
import {
  notEmpty
} from '@ember/object/computed';
import {
  isEmpty
} from '@ember/utils';

import {
  schedule
} from '@ember/runloop';

import ComponentViewItem from 'ember-inspector/models/component-view-item';

const buildObjectIdList = function(children, list) {
  children.forEach(function(child) {
    if (child.children.length) {
      list.push(child.value.objectId);
      buildObjectIdList(child.children, list);
    }
  });
};

const getIdFromObj = function(obj) {
  return get(obj, 'view.objectId') || get(obj, 'view.controller.objectId') || get(obj, 'view.elementId');
};

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
    children: treeNode.children
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
  displayedList: computed('filteredArray.@each.visible', function() {
    return this.filteredArray.filterBy('visible');
  }),

  filteredArray: computed('viewArray.[]', function() {
    let viewArray = this.viewArray;
    let expandedStateCache = this.expandedStateCache;
    viewArray.forEach(viewItem => {
      let cachedExpansion = expandedStateCache[getIdFromObj(viewItem)];
      if (cachedExpansion !== undefined) {
        viewItem.set('expanded', cachedExpansion);
      } else {
        expandedStateCache[getIdFromObj(viewItem)] = viewItem.expanded;
      }
    });

    return viewArray;
  }),

  viewArray: computed('viewTree', 'searchValue', function() {
    let tree = this.viewTree;
    if (!tree) {
      return [];
    }
    return flattenSearchTree(this.searchValue, tree, null, 0, false, []);
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
    let node = this.filteredArray.find(item => item.get('id') === objectId);
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
    let selectedItemIndex = this.displayedList.findIndex(item => item.view.objectId === objectId);

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

  /**
   * @param {array} objects Array of objectids
   * @param {boolean} state expanded state for objects
   */
  setExpandedStateForObjects(objects, state) {
    this.filteredArray.forEach((item) => {
      const id = getIdFromObj(item);
      if (objects.includes(id)) {
        item.set('expanded', state);
        this.expandedStateCache[id] = state;
      }
    });
  },

  /**
   * Builds array of objectids and the expanded state they should be set to
   * @param {ComponentViewItem} item
   */
  toggleWithChildren(item) {
    const newState = !item.get('expanded');
    const list = [];
    const clickedId = getIdFromObj(item);

    list.push(clickedId);
    buildObjectIdList(item.children, list);
    this.setExpandedStateForObjects(list, newState);
  },

  /**
   * Scrolls the main page to put the selected element into view
   */
  scrollToElement: action(function(objectId, event) {
    event.stopPropagation();

    this.port.send('view:scrollToElement', {
      elementId: objectId // TODO: what?
    });
  }),

  showPreviewLayer: action(function(
    {
      view: {
        objectId,
        elementId,
        renderNodeId
      }
    }) {
    // We are passing all of objectId, elementId, and renderNodeId to support post-glimmer 1, post-glimmer 2, and root for
    // post-glimmer 2
    this.port.send('view:previewLayer', {
      objectId,
      renderNodeId,
      elementId
    });
  }),

  hidePreviewLayer: action(function() {
    this.port.send('view:hidePreview');
  }),

  toggleExpanded: action(function(item, event) {
    event.stopPropagation();

    if (event.altKey) {
      this.toggleWithChildren(item);
    } else {
      item.toggleProperty('expanded');
      this.expandedStateCache[getIdFromObj(item)] = item.get('expanded');
    }
  }),

  viewInElementsPanel: action(function(item, event) {
    event.stopPropagation();

    const objectId = item.get('view.objectId');
    const elementId = item.get('view.elementId');

    if (objectId || elementId) {
      this.port.send('view:inspectElement', {
        objectId,
        elementId
      });
    }
  }),

  /**
   * Expand or collapse all component nodes
   * @param {Boolean} expanded if true, expanded, if false, collapsed
   */
  expandOrCollapseAll: action(function(expanded) {
    this.expandedStateCache = {};
    this.filteredArray.forEach((item) => {
      item.set('expanded', expanded);
      this.expandedStateCache[getIdFromObj(item)] = expanded;
    });
  }),

  toggleViewInspection: action(function() {
    this.port.send('view:inspectViews', {
      inspect: !this.inspectingViews
    });
  }),

  inspect: action(function(objectId) {
    if (this.get('pinnedObjectId') === objectId) return;
    if (objectId) {
      this.set('pinnedObjectId', objectId);
      this.expandToNode(objectId);
      this.scrollTreeToItem(objectId);
      this.port.send('objectInspector:inspectById', {
        objectId
      });
    }
  })
});
