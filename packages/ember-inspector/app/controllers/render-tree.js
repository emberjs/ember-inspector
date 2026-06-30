/* eslint-disable ember/no-computed-properties-in-native-classes */
import { action, computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import { service } from '@ember/service';

import escapeRegExp from '../utils/escape-reg-exp';
import debounceComputed from '../computed/debounce';
import { isNullish } from '../utils/nullish';

export default class RenderTreeController extends Controller {
  @service adapter;
  @service port;
  /**
   * Storage is needed for remembering if the user closed the warning
   */
  @service storage;

  @tracked initialEmpty = false;
  @tracked shouldHighlightRender = false;
  @tracked search = '';

  get escapedSearch() {
    return escapeRegExp(this.search?.toLowerCase());
  }

  /**
   * Indicate the table's header's height in pixels.
   *
   * @property headerHeight
   * @type {Number}
   */
  get headerHeight() {
    return this.isWarningClosed ? 31 : 56;
  }

  /**
   * Checks if the user previously closed the warning by referencing localStorage
   */
  get isWarningClosed() {
    return !!this.storage.getItem('is-render-tree-warning-closed');
  }

  set isWarningClosed(value) {
    this.storage.setItem('is-render-tree-warning-closed', value);
  }

  get modelEmpty() {
    return this.model.profiles.length === 0;
  }

  get showEmpty() {
    return this.initialEmpty && this.modelEmpty;
  }

  // bound to the input field, updates the `search` property
  // 300ms after changing
  @debounceComputed('search', 300)
  searchValue;

  @computed('model.isHighlightSupported')
  get isHighlightEnabled() {
    return this.model.isHighlightSupported;
  }

  @computed('escapedSearch', 'model.profiles.@each.name', 'search')
  get filtered() {
    if (isNullish(this.escapedSearch)) {
      return this.model.profiles;
    }

    return this.model.profiles.filter((item) => {
      const regExp = new RegExp(this.escapedSearch);
      return recursiveMatch(item, regExp);
    });
  }

  @action
  clearProfiles() {
    this.port.send('render:clear');
  }

  @action
  closeWarning() {
    this.isWarningClosed = true;
  }

  @action
  updateShouldHighlightRender() {
    const value = !this.shouldHighlightRender;
    this.shouldHighlightRender = value;
    this.port.send('render:updateShouldHighlightRender', {
      shouldHighlightRender: value,
    });
  }
}

function recursiveMatch(item, regExp) {
  if (item.name.toLowerCase().match(regExp)) {
    return true;
  }

  for (const child of item.children) {
    if (recursiveMatch(child, regExp)) {
      return true;
    }
  }

  return false;
}
