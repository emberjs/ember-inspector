/* eslint-disable ember/require-tagless-components */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { debounce } from '@ember/runloop';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';

export default class ScrollContainerComponent extends Component {
  <template>
    <div
      class="scroll-target"
      style={{this.scrollTargetStyle}}
      role="presentation"
      {{this.scrollIntoView this.currentItem this.previewing}}
    ></div>
    {{yield}}
  </template>
  attributeBindings = ['style'];

  @tracked collection;
  @tracked currentItem;
  @tracked previewing;
  @tracked itemHeight;
  lastCurrentItem;

  get style() {
    return htmlSafe(`
      position: relative;
      height: 100%;
    `);
  }

  get scrollTargetStyle() {
    let { index, itemHeight } = this;

    if (index === -1) {
      return htmlSafe('display: none;');
    } else {
      return htmlSafe(`
        position: absolute;
        width: 100%;
        height: ${itemHeight || 0}px;
        margin: 0px;
        padding: 0px;
        top: ${index * itemHeight || 0}px;
        left: 0px;
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

  /**
   * Scrolls the target into view when the current or previewed item changes.
   * On the first run, the list has not rendered its rows yet, so it waits.
   */
  scrollIntoView = modifier((target, [currentItem, previewing]) => {
    if (!this.hasScrolled) {
      this.hasScrolled = true;
      // eslint-disable-next-line ember/no-runloop
      debounce(this, this.scrollIntoViewIfNeeded, 50);
    } else if (previewing || currentItem) {
      this.scrollIntoViewIfNeeded();
    }
  });

  hasScrolled = false;

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
  if (!container || !target) return false;

  let { top: containerTop, bottom: containerBottom } =
    container.getBoundingClientRect();
  let { top: targetTop, bottom: targetBottom } = target.getBoundingClientRect();
  return targetTop < containerTop || targetBottom > containerBottom;
}
