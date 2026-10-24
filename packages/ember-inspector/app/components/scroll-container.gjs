import Component from '@glimmer/component';
import { debounce } from '@ember/runloop';
import { trustHTML } from '@ember/template';
import { modifier } from 'ember-modifier';

export default class ScrollContainerComponent extends Component {
  <template>
    <div class="relative h-full" {{this.captureElement}} ...attributes>
      <div
        class="scroll-target"
        style={{this.scrollTargetStyle}}
        role="presentation"
        {{this.scrollIntoView @currentItem @previewing}}
      ></div>
      {{yield}}
    </div>
  </template>

  element;
  lastCurrentItem;

  captureElement = modifier((element) => {
    this.element = element;
  });

  get scrollTargetStyle() {
    let { index } = this;
    let { itemHeight } = this.args;

    if (index === -1) {
      return trustHTML('display: none;');
    } else {
      return trustHTML(`
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
    return this.args.collection.indexOf(
      this.args.previewing || this.args.currentItem,
    );
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
    let { currentItem, previewing } = this.args;

    if (this.lastCurrentItem?.id === currentItem?.id && !previewing) {
      return;
    }

    if (!previewing) {
      this.lastCurrentItem = currentItem;
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
