/* eslint-disable ember/require-tagless-components */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import { indentItem } from './render-item';

export default class ScrollContainerComponent extends Component {
  attributeBindings = ['style'];

  @tracked collection;
  @tracked currentItem;
  @tracked previewing;
  @tracked itemHeight;
  lastCurrentItem;

  lastIndex = -1;
  lastItem = undefined;

  get style() {
    return htmlSafe(`
      position: relative;
      height: 100%;
    `);
  }

  get scrollTargetStyle() {
    let { index, itemHeight, previewing, currentItem } = this;

    if (index === -1) {
      return htmlSafe('display: none;');
    } else {
      const level = previewing?.level ?? currentItem?.level ?? 0;
      const left = indentItem(level) + 10;
      const height = itemHeight ?? 0;

      return htmlSafe(`
        position: absolute;
        width: 100%;
        height: ${height}px;
        margin: 0px;
        padding: 0px;
        top: ${index * height}px;
        left: ${left}px;
        z-index: -9999;
        pointer-events: none;
      `);
    }
  }

  get index() {
    return this.collection.indexOf(this.previewing || this.currentItem);
  }

  get scrollTarget() {
    return this.element?.querySelector('.scroll-target');
  }

  @action
  elementInserted() {
    let { index, lastIndex, currentItem, lastItem } = this;

    if (index !== lastIndex || currentItem !== lastItem) {
      this.lastIndex = index;
      this.lastItem = currentItem;

      // eslint-disable-next-line ember/no-runloop
      debounce(this, this.scrollIntoViewIfNeeded, 50);
    }
  }

  @action
  scrollPreviewIntoViewIfNeeded() {
    if (this.previewing) {
      this.scrollIntoViewIfNeeded();
    }
  }

  @action
  scrollIntoViewIfNeeded() {
    let { element, scrollTarget } = this;

    if (this.lastCurrentItem?.id === this.currentItem?.id && !this.previewing) {
      return;
    }

    if (!this.previewing) {
      this.lastCurrentItem = this.currentItem;
    }

    if (needsScroll(element, scrollTarget)) {
      scrollTarget.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }
}

function needsScroll(container, target) {
  if (!container || !target) {
    return false;
  }

  let {
    top: containerTop,
    bottom: containerBottom,
    left: containerLeft,
  } = container.getBoundingClientRect();

  let {
    top: targetTop,
    bottom: targetBottom,
    left: targetLeft,
  } = target.getBoundingClientRect();

  return (
    targetTop < containerTop ||
    targetBottom > containerBottom ||
    targetLeft > containerLeft
  );
}
