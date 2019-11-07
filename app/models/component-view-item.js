import { tracked } from '@glimmer/tracking';

/**
 * ComponentViewItem is used to represent the flattened nodes in the component tree
 */
export default class ComponentViewItem {
  /**
   * If the user has typed text into the search box (used to calculate visibility)
   */
  @tracked activeSearch;
  @tracked searchMatched;
  @tracked expanded;

  constructor({ treeNode, parent, parentCount, searchMatched, activeSearch, expanded }) {
    /**
     * A reference to the tree node from GlimmerTree
     */
    this.treeNode = treeNode;

    /**
     * A reference to the parent `ComponentViewItem`, null at the root of the tree
     */
    this.parent = parent;

    /**
     * Used to set indentation levels later
     */
    this.parentCount = parentCount;

    this.activeSearch = activeSearch;
    this.searchMatched = searchMatched;
    this.expanded = expanded;
  }

  get view() {
    return this.treeNode.value;
  }

  get isComponent() {
    return this.view && this.view.isComponent;
  }


  get hasElement() {
    return this.isComponent && this.view.tagName !== '';
  }

  get id() {
    return this.view && this.view.objectId;
  }

  get name() {
    return this.view && this.view.name;
  }

  get children() {
    return this.treeNode.children;
  }

  get hasChildren() {
    return this.children.length > 0;
  }

  get visible() {
    let { parent, activeSearch } = this;

    let showNodeInHierarchy = parent && parent.expanded && parent.visible;

    if (activeSearch) {
      return this.searchMatched || showNodeInHierarchy;
    } else {
      return !parent || showNodeInHierarchy;
    }
  }

  expandParents() {
    let { parent } = this;

    if (parent) {
      parent.expanded = true;
      parent.expandParents();
    }
  }
}
