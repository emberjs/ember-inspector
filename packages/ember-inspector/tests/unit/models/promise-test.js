import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { set } from '@ember/object';
import { settled } from '@ember/test-helpers';
import PromiseModel from 'ember-inspector/models/promise';

function createChild(parent, props) {
  let child = PromiseModel.create(props);

  parent.children.push(child);
  child.parent = parent;

  return child;
}

module('Unit | Model | promise', function (hooks) {
  setupTest(hooks);

  test('a new label reaches the branch labels of the parents', async function (assert) {
    let root = PromiseModel.create({ label: 'root', state: 'pending' });
    let parent = createChild(root, { label: 'parent', state: 'pending' });
    let child = createChild(parent, { state: 'pending' });

    await settled();
    assert.false(root.matches('child-label'));

    set(child, 'label', 'child-label');
    await settled();

    assert.strictEqual(child.branchLabel, 'child-label');
    assert.true(parent.matches('child-label'), 'the parent matches');
    assert.true(root.matches('child-label'), 'the root matches');
  });

  test('a rejected child expands its parent when it gets the parent', async function (assert) {
    let parent = PromiseModel.create({ label: 'parent', state: 'pending' });
    let child = PromiseModel.create({ label: 'child', state: 'rejected' });

    await settled();
    assert.false(parent.isExpanded, 'a promise starts collapsed');

    /**
     * Like the promise assembler, which sets `parent` with `setProperties`.
     */
    parent.children.push(child);
    set(child, 'parent', parent);
    await settled();

    assert.true(parent.isExpanded, 'the parent expands');
  });
});
