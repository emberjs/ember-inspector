import EmberObject, { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

/**
 * ComponentViewItem is used to represent the flattened nodes in the component tree
 */
export default EmberObject.extend({
  /**
   * The Ember View object this item represents
   */
  renderNode: null,

  view: computed('renderNode', function() {
    // TODO
    // console.error('someone is using .view, change it to .renderNode');
    return this.renderNode;
  }),

  isComponent: computed('renderNode.type', function() {
    return this.renderNode.type === 'component';
  }),

  isOutlet: computed('renderNode.type', function() {
    return this.renderNode.type === 'outlet';
  }),

  isEngine: computed('renderNode.type', function() {
    return this.renderNode.type === 'engine';
  }),

  isRouteTemplate: computed('renderNode.type', function() {
    return this.renderNode.type === 'route-template';
  }),

  hasBounds: computed('renderNode.bounds', function() {
    return this.renderNode.bounds !== null;
  }),

  hasInstance: computed('renderNode.instance', function() {
    let { instance } = this.renderNode;
    return typeof instance === 'object' && instance !== null;
  }),

  name: computed('renderNode.name', function() {
    return this.renderNode.name;
  }),

  /**
   * A reference to the parent `ComponentViewItem`, null at the root of the tree
   */
  parent: null,

  /**
   * Used to set indentation levels later
   */
  parentCount: 0,
  expanded: true,
  children: null,
  hasChildren: true,
  searchMatched: false,

  /**
   * If the user has typed text into the search box (used to calculate visibility)
   */
  activeSearch: false,

  id: reads('renderNode.id'),

  expandParents() {
    let parent = this.parent;
    if (parent) {
      parent.set('expanded', true);
      parent.expandParents();
    }
  },

  visible: computed(
    'parent.{visible,expanded}',
    'searchMatched',
    'activeSearch',
    function() {
      let parent = this.parent;
      let showNodeInHierarchy =
        parent && parent.get('expanded') && parent.get('visible');
      if (this.activeSearch) {
        return this.searchMatched || showNodeInHierarchy;
      } else {
        return !parent || showNodeInHierarchy;
      }
    }
  ),
});
