import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import ReloadIcon from 'ember-inspector/svg/reload.svg?unsafe-inline';
import SidebarToggleIcon from 'ember-inspector/svg/sidebar-toggle.svg?unsafe-inline';

module('Integration | Component | svg icons', function (hooks) {
  setupRenderingTest(hooks);

  test('an icon renders its markup inline, with its own size', async function (assert) {
    await render(<template><ReloadIcon data-test-icon /></template>);

    let svg = find('[data-test-icon]');

    assert.strictEqual(svg.tagName, 'svg');
    assert.strictEqual(svg.getAttribute('viewBox'), '0 0 54.203 55.142');
    assert.strictEqual(svg.getAttribute('width'), '13');
    assert.strictEqual(svg.getAttribute('height'), '13');
    assert.strictEqual(svg.querySelectorAll('use').length, 0, 'not a sprite');
  });

  test('attributes replace the size and add a class', async function (assert) {
    await render(
      <template>
        <ReloadIcon width="20px" height="10px" class="icon" data-test-icon />
      </template>,
    );

    assert.dom('[data-test-icon]').hasAttribute('width', '20px');
    assert.dom('[data-test-icon]').hasAttribute('height', '10px');
    assert.dom('[data-test-icon]').hasClass('icon');
  });

  /**
   * The styles color the icons through these classes,
   * so they must reach the DOM.
   */
  test('the classes inside the svg stay', async function (assert) {
    await render(<template><SidebarToggleIcon data-test-icon /></template>);

    assert.dom('[data-test-icon] .svg-stroke').exists();
  });

  /**
   * The component keeps only viewBox, width and height of the root <svg>.
   * An icon that is drawn with strokes keeps `fill="none"` on a group.
   */
  test('a stroked icon is not filled', async function (assert) {
    await render(<template><SidebarToggleIcon data-test-icon /></template>);

    let path = find('[data-test-icon] path');

    assert.strictEqual(getComputedStyle(path).fill, 'none');
  });
});
