import { action, computed, get } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import escapeRegExp from 'ember-inspector/utils/escape-reg-exp';
import debounceComputed from 'ember-inspector/computed/debounce';
import { and, equal } from '@ember/object/computed';

export default class RenderTreeController extends Controller {
  @service adapter;
  @service port;
  /**
   * Storage is needed for remembering if the user closed the warning
   *
   * @property storage
   * @type {Service}
   */
  @service storage;

  initialEmpty = false;
  @tracked shouldHighlightRender = false;
  @tracked search = '';

  @equal('model.profiles.length', 0)
  modelEmpty;

  @and('initialEmpty', 'modelEmpty')
  showEmpty;

  /**
   * Checks if the user previously closed the warning by referencing localStorage
   *
   * @property isWarningClosed
   * @type {Boolean}
   */
  get isWarningClosed() {
    return !!this.storage.getItem('is-render-tree-warning-closed');
  }

  set isWarningClosed(value) {
    this.storage.setItem('is-render-tree-warning-closed', value);
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

  // bound to the input field, updates the `search` property
  // 300ms after changing
  @debounceComputed('search', 300)
  searchValue;

  get escapedSearch() {
    return escapeRegExp(this.search?.toLowerCase());
  }

  @computed('model.isHighlightSupported')
  get isHighlightEnabled() {
    return get(this.model, 'isHighlightSupported');
  }

  @computed('escapedSearch', 'model.profiles.@each.name', 'search')
  get filtered() {
    if (isEmpty(this.escapedSearch)) {
      return get(this.model, 'profiles');
    }

    return get(this.model, 'profiles').filter((item) => {
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
    this.set('isWarningClosed', true);
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
