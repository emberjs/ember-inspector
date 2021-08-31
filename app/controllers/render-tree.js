import { action, computed, get } from '@ember/object';
import { isEmpty } from '@ember/utils';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import escapeRegExp from 'ember-inspector/utils/escape-reg-exp';
import debounceComputed from 'ember-inspector/computed/debounce';
import { and, equal } from '@ember/object/computed';

export default Controller.extend({
  initialEmpty: false,
  modelEmpty: equal('model.length', 0),
  showEmpty: and('initialEmpty', 'modelEmpty'),
  shouldHighlightRender: false,

  port: service(),

  /**
   * Storage is needed for remembering if the user closed the warning
   *
   * @property storage
   * @type {Service}
   */
  storage: service(),

  /**
   * Checks if the user previously closed the warning by referencing localStorage
   *
   * @property isWarningClosed
   * @type {Boolean}
   */
  isWarningClosed: computed({
    get() {
      return !!this.storage.getItem('is-render-tree-warning-closed');
    },
    set(key, value) {
      this.storage.setItem('is-render-tree-warning-closed', value);
      return value;
    },
  }),

  /**
   * Indicate the table's header's height in pixels.
   *
   * @property headerHeight
   * @type {Number}
   */
  headerHeight: computed('isWarningClosed', function () {
    return this.isWarningClosed ? 31 : 56;
  }),

  // bound to the input field, updates the `search` property
  // 300ms after changing
  searchValue: debounceComputed('search', 300),

  // model filtered based on this value
  search: '',

  escapedSearch: computed('search', function () {
    return escapeRegExp(this.search.toLowerCase());
  }),

  filtered: computed(
    'escapedSearch',
    'model.@each.name',
    'search',
    function () {
      if (isEmpty(this.escapedSearch)) {
        return this.model;
      }

      return this.model.filter((item) => {
        const regExp = new RegExp(this.escapedSearch);
        return recursiveMatch(item, regExp);
      });
    }
  ),

  closeWarning: action(function () {
    this.set('isWarningClosed', true);
  }),

  updateShouldHighlightRender: action(function () {
    const value = !this.shouldHighlightRender
    this.set('shouldHighlightRender', value);
    this.port.send('render:updateShouldHighlightRender', {
      shouldHighlightRender: value,
    });
  }),
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
