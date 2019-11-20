import {
  action,
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

const flattenSearchTreeNodes = (
  searchValue,
  treeNodes,
  parent,
  parentCount,
  parentMatched,
  list
) => {
  let flattened = [];

  for (let treeNode of treeNodes) {
    flattened.push(...flattenSearchTreeNode(
      searchValue,
      treeNode,
      parent,
      parentCount,
      parentMatched,
      list
    ));
  }

  return flattened;
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
const flattenSearchTreeNode = (
  searchValue,
  treeNode,
  parent,
  parentCount,
  parentMatched,
  list
) => {
  let activeSearch = !isEmpty(searchValue);
  let searchMatched = activeSearch ?
    searchMatch(treeNode.name, searchValue) :
    true;

  let viewItem = ComponentViewItem.create({
    renderNode: treeNode,
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
    flattenSearchTreeNode(
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
  queryParams: ['pinned'],

  /**
   * The entry in the component tree corresponding to the id
   * will be selected
   */

  pinned: null,
  isInspecting: false,

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
      let cachedExpansion = expandedStateCache[viewItem.id];
      if (cachedExpansion !== undefined) {
        viewItem.set('expanded', cachedExpansion);
      } else {
        expandedStateCache[viewItem.id] = viewItem.expanded;
      }
    });

    return viewArray;
  }),

  viewArray: computed('viewTree', 'searchValue', function() {
    let tree = this.viewTree;
    if (!tree) {
      return [];
    }
    return flattenSearchTreeNodes(this.searchValue, tree, null, 0, false, []);
  }),

  expandedStateCache: null, //set on init

  init() {
    this._super(...arguments);
    this.set('expandedStateCache', {});
  },

  /**
   * Expands the component tree so that entry for the given render node will
   * be shown. Recursively expands the entry's parents up to the root.
   * @param {*} id The id of the render node to show
   */
  expandToNode(id) {
    let node = this.filteredArray.find(item => item.id === id);
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
  scrollTreeToItem(id) {
    let selectedItemIndex = this.displayedList.findIndex(item => item.id === id);

    if (selectedItemIndex === -1) {
      return;
    }

    const averageItemHeight = 22;
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
   * @param {array} objects Array of render node ids
   * @param {boolean} state expanded state for objects
   */
  setExpandedStateForObjects(ids, state) {
    this.filteredArray
      .filter(item => ids.indexOf(item.id) > -1)
      .forEach(item => {
        item.set('expanded', state);
        this.expandedStateCache[item.id] = state;
      });
  },

  /**
   * Builds array of objectids and the expanded state they should be set to
   * @param {ComponentViewItem} item
   */
  toggleWithChildren(item) {
    let newState = !item.expanded;
    let ids = [];

    let collectIds = item => {
      ids.push(item.id);
      item.children.forEach(collectIds);
    };

    collectIds(item);

    this.setExpandedStateForObjects(ids, newState);
  },

  /**
   * Scrolls the main page to put the selected element into view
   */
  scrollIntoView: action(function(id, event) {
    event.stopPropagation();
    this.port.send('view:scrollIntoView', { id });
  }),

  showPreview: action(function(id) {
    this.port.send('view:showPreview', { id });
  }),

  hidePreview: action(function() {
    this.port.send('view:hidePreview');
  }),

  toggleExpanded: action(function(item, event) {
    event.stopPropagation();

    if (event.altKey) {
      this.toggleWithChildren(item);
    } else {
      item.toggleProperty('expanded');
      this.expandedStateCache[item.id] = item.get('expanded');
    }
  }),

  viewInElementsPanel: action(function(id, event) {
    event.stopPropagation();
    this.port.send('view:inspect', { id });
  }),

  /**
   * Expand or collapse all component nodes
   * @param {Boolean} expanded if true, expanded, if false, collapsed
   */
  expandOrCollapseAll: action(function(expanded) {
    this.expandedStateCache = {};
    this.filteredArray.forEach((item) => {
      item.set('expanded', expanded);
      this.expandedStateCache[item.id] = expanded;
    });
  }),

  toggleViewInspection: action(function() {
    this.port.send('view:inspectViews', {
      inspect: !this.isInspecting
    });
  }),

  inspect: action(function({ id, instance }) {
    if (id === this.pinned) {
      return;
    }

    this.set('pinned', id);
    this.expandToNode(id);
    this.scrollTreeToItem(id);

    if (typeof instance === 'object' && instance !== null) {
      this.port.send('objectInspector:inspectById', { objectId: instance.id });
    } else {
      this.application.set('inspectorExpanded', false);
    }
  })
});
