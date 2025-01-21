import { action, computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

import escapeRegExp from '../utils/escape-reg-exp';
// @ts-expect-error TODO: not yet typed
import debounceComputed from '../computed/debounce';
import type WebExtension from '../services/adapters/web-extension';
import type PortService from '../services/port';
import type StorageService from '../services/storage';
import type { RenderTreeModel } from '../routes/render-tree';
import { isNullish } from '../utils/nullish';

export default class RenderTreeController extends Controller {
  @service declare adapter: WebExtension;
  @service declare port: PortService;
  /**
   * Storage is needed for remembering if the user closed the warning
   */
  @service declare storage: StorageService;

  declare model: RenderTreeModel;

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
    // @ts-expect-error Ignore this boolean/string mismatch for now.
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
  searchValue: any;

  @computed('model.isHighlightSupported')
  get isHighlightEnabled() {
    return this.model.isHighlightSupported;
  }

  @computed('escapedSearch', 'model.profiles.@each.name', 'search')
  get filtered() {
    if (isNullish(this.escapedSearch)) {
      return this.model.profiles;
    }

    return this.model.profiles.filter(
      (item: RenderTreeModel['profiles'][number]) => {
        const regExp = new RegExp(this.escapedSearch as string);
        return recursiveMatch(item, regExp);
      },
    );
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

function recursiveMatch(
  item: RenderTreeModel['profiles'][number],
  regExp: string | RegExp,
) {
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
