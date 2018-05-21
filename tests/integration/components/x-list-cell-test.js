import {
  module,
  test
} from 'qunit';
import {
  setupRenderingTest
} from 'ember-qunit';
import {
  render
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import {
  find
} from 'ember-native-dom-helpers';

module('Integration | Component | x-list-cell', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders content in a td by default', async function (assert) {
    await render(hbs `
      {{#x-list-cell}}
        <span>template block text</span>
      {{/x-list-cell}}
    `);

    assert.equal(find('td').textContent.trim(), 'template block text');
  });

  test('it renders content when the column is one of the current columns', async function (assert) {
    this.set('columns', [{
      id: 'name'
    }]);
    await render(hbs `
      {{#x-list-cell columns=columns column="name"}}
        <span>template block text</span>
      {{/x-list-cell}}
    `);

    assert.equal(find('td').textContent.trim(), 'template block text');
  });

  test('it renders nothing when the column is not one of the current columns', async function (assert) {
    this.set('columns', [{
      id: 'name'
    }]);
    await render(hbs `
      {{#x-list-cell columns=columns column="otherField"}}
        <span>template block text</span>
      {{/x-list-cell}}
    `);

    assert.notOk(find('td'), 'it does not render an element');
  });
});
