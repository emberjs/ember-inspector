import {
  on
} from '@ember/object/evented';
import EmberObject, {
  observer,
  get,
  computed
} from '@ember/object';
import Controller, {
  inject as controller
} from '@ember/controller';
import searchMatch from 'ember-inspector/utils/search-match';
import {
  notEmpty,
  reads
} from '@ember/object/computed';
import {
  isEmpty
} from '@ember/utils';

let ComponentViewItem = EmberObject.extend({
  view: null,
  parent: null,
  parentCount: 0,
  expanded: true,
  hasChildren: true,
  searchMatched: false,
  activeSearch: false,

  id: reads('view.objectId'),
  visible: computed(
    'parent.{visible,expanded}',
    'searchMatched',
    'activeSearch',
    function () {
      let parent = this.get('parent');
      if (this.get('activeSearch')) {
        return this.get('searchMatched') || (parent && parent.get('expanded') && parent.get('visible'));
      } else {
        return !parent || (parent && parent.get('expanded') && parent.get('visible'))
      }
    }),
});

const flattenSearchTree = (
  searchText,
  treeNode,
  parent,
  parentCount,
  parentMatched,
  list
) => {
  let searchMatched = searchMatch(get(treeNode, 'value.name'), searchText);

  let viewItem = ComponentViewItem.create({
    view: treeNode.value,
    parent,
    parentCount,
    searchMatched,
    activeSearch: true,
    expanded: false,
    hasChildren: treeNode.children.length > 0,
  });

  if (searchMatched || parentMatched) {
    list.push(viewItem);
  }

  let newParentCount = (searchMatched || parentMatched) ? parentCount + 1 : 0;

  treeNode.children.forEach(child => {
    flattenSearchTree(
      searchText,
      child,
      viewItem,
      newParentCount,
      searchMatched || parentMatched,
      list
    );
  });
  return list;
};

const flattenTree = (treeNode, parent, parentCount, list) => {
  let viewItem = ComponentViewItem.create({
    view: treeNode.value,
    parent,
    activeSearch: false,
    parentCount,
    expanded: true,
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

  activeSearch: notEmpty('searchText'),

  /**
   * The filtered view list.
   *
   * @property filteredList
   * @type {Array<Object>}
   */
  displayedList: computed('filteredArray.@each.visible', function () {
    return this.get('filteredArray').filterBy('visible');
  }),

  filteredArray: computed('viewArray.[]', function () {
    return this.get('viewArray');
  }),

  viewArray: computed('viewTree', 'searchText', function () {
    let tree = this.get('viewTree');
    if (!tree) {
      return [];
    }
    if (isEmpty(this.get('searchText'))) {
      return flattenTree(tree, null, 0, []);
    } else {
      return flattenSearchTree(this.get('searchText'), tree, null, 0, false, []);
    }
  }),

  init() {
    this._super(...arguments);
    this.port.send('view:setOptions', {
      options: this.get('options')
    });
  },

  optionsChanged: on(
    'init',
    observer('options.components', function () {
      this.port.send('view:setOptions', {
        options: this.get('options')
      });
    })
  ),

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
        objectId
      });
    },

    inspect(objectId) {
      if (objectId) {
        this.set('pinnedObjectId', objectId);
        this.get('port').send('objectInspector:inspectById', {
          objectId
        });
      }
    },

    inspectElement({
      objectId,
      elementId
    }) {
      this.get('port').send('view:inspectElement', {
        objectId,
        elementId
      });
    },
  },
});
