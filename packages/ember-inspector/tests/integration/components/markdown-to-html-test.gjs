import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import MarkdownToHtml from 'ember-inspector/components/markdown-to-html';

module('Integration | Component | markdown-to-html', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders markdown as html', async function (assert) {
    const markdown = '## Release\n\n- a [link](https://emberjs.com)';

    await render(
      <template>
        <MarkdownToHtml @markdown={{markdown}} data-test-markdown />
      </template>,
    );

    assert.dom('[data-test-markdown] h2').hasText('Release');
    assert
      .dom('[data-test-markdown] li a')
      .hasAttribute('href', 'https://emberjs.com');
  });

  test('it renders nothing without markdown', async function (assert) {
    await render(<template><MarkdownToHtml data-test-markdown /></template>);

    assert.dom('[data-test-markdown]').hasNoText();
  });
});
