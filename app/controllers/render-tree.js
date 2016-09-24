import Ember from "ember";
import escapeRegExp from "ember-inspector/utils/escape-reg-exp";
import debounceComputed from "ember-inspector/computed/debounce";
import LocalStorageService from "ember-inspector/services/storage/local";

const { computed, isEmpty, Controller, inject: { controller, service } } = Ember;
const { and, equal, filter } = computed;
const get = Ember.get;

export default Controller.extend({
  application: controller(),
  initialEmpty: false,
  modelEmpty: equal('model.length', 0),
  showEmpty: and('initialEmpty', 'modelEmpty'),

  /**
   * Service used for storage. Storage is
   * needed for remembering if the user closed the warning
   * as it might get mildly annoying for devs to see and close
   * the trivial warning every time.
   * The default storage service is local storage however we
   * fall back to memory storage if local storage is disabled (For
   * example as a security setting in Chrome).
   *
   * @property storage
   * @type {Service}
   */
  storage: service(`storage/${LocalStorageService.SUPPORTED ? 'local' : 'memory'}`),

  /**
   * Checks if the user previously closed the warning by referencing localStorage
   * it is a computed get/set property.
   *
   * @property isWarningClosed
   * @type {Boolean}
   */
  isWarningClosed: computed({
    get() {
      return !!this.get('storage').getItem('is-render-tree-warning-closed');
    },
    set(key, value) {
      this.get('storage').setItem('is-render-tree-warning-closed', value);
      return value;
    }
  }),

  /**
   * Indicate the table's header's height in pixels.
   *
   * @property headerHeight
   * @type {Number}
   */
  headerHeight: computed('isWarningClosed', function() {
    return this.get('isWarningClosed') ? 31 : 56;
  }),

  actions: {
    /**
     * This action when triggered, closes the warning message for rendering times being inaccurate
     * and sets `isWarningClosed` value to true, thus preventing the warning from being shown further.
     *
     * @method closeWarning
     */
    closeWarning() {
      this.set('isWarningClosed', true);
    }
  },

  // bound to the input field, updates the `search` property
  // 300ms after changing
  searchField: debounceComputed('search', 300),

  // model filtered based on this value
  search: '',

  escapedSearch: computed('search', function() {
    return escapeRegExp(this.get('search').toLowerCase());
  }),

  filtered: filter('model', function(item) {
    let search = this.get('escapedSearch');
    if (isEmpty(search)) {
      return true;
    }
    let regExp = new RegExp(search);
    return !!recursiveMatch(item, regExp);
  }).property('model.@each.name', 'search')
});

function recursiveMatch(item, regExp) {
  let children, child;
  let name = get(item, 'name');
  if (name.toLowerCase().match(regExp)) {
    return true;
  }
  children = get(item, 'children');
  for (let i = 0; i < children.length; i++) {
    child = children[i];
    if (recursiveMatch(child, regExp)) {
      return true;
    }
  }
  return false;
}
