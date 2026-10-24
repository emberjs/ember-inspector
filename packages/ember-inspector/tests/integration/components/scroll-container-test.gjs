import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render, rerender, settled } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { trustHTML } from '@ember/template';
import { modifier } from 'ember-modifier';
import ScrollContainer from 'ember-inspector/components/scroll-container';

const ITEM_HEIGHT = 20;
const PARENT_STYLE = trustHTML('height: 100px');
const ITEM_STYLE = trustHTML(`height: ${ITEM_HEIGHT}px`);

class State {
  items = Array.from({ length: 30 }, (_, index) => ({ id: `item-${index}` }));
  @tracked currentItem;
  @tracked previewing;
}

function renderList(state, attributes = {}) {
  const recordElement = modifier((element) => {
    attributes.modified = element;
  });

  return render(
    <template>
      <div style={{PARENT_STYLE}}>
        <ScrollContainer
          @collection={{state.items}}
          @currentItem={{state.currentItem}}
          @previewing={{state.previewing}}
          @itemHeight={{ITEM_HEIGHT}}
          class="list-content"
          tabindex="-1"
          data-test-scroll-container
          {{recordElement}}
        >
          {{#each state.items as |item|}}
            <div style={{ITEM_STYLE}}>{{item.id}}</div>
          {{/each}}
        </ScrollContainer>
      </div>
    </template>,
  );
}

module('Integration | Component | scroll-container', function (hooks) {
  setupRenderingTest(hooks);

  test('the caller attributes and modifiers go on the wrapper', async function (assert) {
    let attributes = {};

    await renderList(new State(), attributes);

    let wrapper = find('[data-test-scroll-container]');

    assert.dom(wrapper).hasClass('list-content');
    assert.dom(wrapper).hasAttribute('tabindex', '-1');
    assert.strictEqual(attributes.modified, wrapper);
  });

  test('the wrapper fills its parent and positions the target', async function (assert) {
    await renderList(new State());

    let wrapper = find('[data-test-scroll-container]');

    assert.strictEqual(getComputedStyle(wrapper).position, 'relative');
    assert.strictEqual(wrapper.offsetHeight, 100);
  });

  test('the scroll target follows the current or previewed item', async function (assert) {
    let state = new State();

    await renderList(state);

    assert.dom('.scroll-target').hasStyle({ display: 'none' });

    state.currentItem = state.items[10];
    await rerender();

    assert.dom('.scroll-target').hasStyle({ top: '200px', height: '20px' });

    state.previewing = state.items[3];
    await rerender();

    assert.dom('.scroll-target').hasStyle({ top: '60px' });
  });

  test('it scrolls the current item into view', async function (assert) {
    let state = new State();
    state.currentItem = state.items[20];

    await renderList(state);
    await settled();

    let wrapper = find('[data-test-scroll-container]');

    assert.true(wrapper.scrollTop > 0, 'it scrolled down to the item');

    let { top, bottom } = wrapper.getBoundingClientRect();
    let target = find('.scroll-target').getBoundingClientRect();

    assert.true(target.top >= top, 'the item starts inside the visible area');
    assert.true(
      target.bottom <= bottom,
      'the item ends inside the visible area',
    );
  });
});
