import {
  click,
  find,
  findAll,
  triggerEvent,
  visit,
  waitUntil,
} from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupTestAdapter, respondWith } from '../test-adapter';

/**
 * The left offset of `element` in the page, in layout pixels.
 *
 * The test page zooms the app, so client rects do not match
 * the `pageX` values that a drag handle reads.
 */
function pageLeft(element) {
  let left = 0;

  for (let el = element; el; el = el.offsetParent) {
    left += el.offsetLeft;
  }

  return left;
}

/**
 * Moves a handle to `start` pixels from the left edge of its container,
 * reads the width of `panel`, then moves the handle `distance` pixels more.
 *
 * Returns the width of `panel` before the second move.
 */
async function drag(handle, panel, start, distance) {
  let container = find(handle).parentNode;
  let x = pageLeft(container) + start;

  await triggerEvent(handle, 'mousedown');
  await triggerEvent(document.body, 'mousemove', { clientX: x });

  let width = panel();

  await triggerEvent(document.body, 'mousemove', { clientX: x + distance });
  await triggerEvent(document.body, 'mouseup');

  return width;
}

function navWidth() {
  return find('.split-panel-sidebar-1').offsetWidth;
}

function inspectorWidth() {
  return find('.split > .split-panel:has(+ .drag-handle-right)').offsetWidth;
}

function firstColumnWidth() {
  return parseFloat(find('.list-header col').style.width);
}

const NAV_HANDLE = '.split-main > .drag-handle-left';
const INSPECTOR_HANDLE = '.split > .drag-handle-right';
const COLUMN_HANDLE = '.list > .drag-handle';

/**
 * The sum of the header column widths of the list.
 */
function columnsWidth() {
  let total = 0;

  for (let col of findAll('.list-header col')) {
    total += parseFloat(col.style.width);
  }

  return total;
}

function tableWidth() {
  return find('.list-header .list-table-container').clientWidth;
}

function columnsFitTable() {
  return Math.abs(columnsWidth() - tableWidth()) < 1;
}

module('Resizing panels', function (outer) {
  setupTestAdapter(outer);
  setupApplicationTest(outer);

  test('dragging the container types handle resizes the types column', async function (assert) {
    respondWith('container:getTypes', {
      type: 'container:types',
      types: [{ name: 'route', count: 1 }],
    });

    await visit('/container-types');

    let typesWidth = () => find('.split-panel-sidebar-2').offsetWidth;
    let start = await drag(
      '.split-panel-sidebar-2 + .drag-handle',
      typesWidth,
      150,
      50,
    );

    assert.strictEqual(typesWidth(), start + 50);
  });

  module('On the promise tab', function (inner) {
    inner.beforeEach(function () {
      respondWith('promise:getInstrumentWithStack', {
        type: 'promise:instrumentWithStack',
        instrumentWithStack: false,
      });
      respondWith('promise:getAndObservePromises', {
        type: 'promise:promisesUpdated',
        promises: [
          {
            guid: 'ember1',
            label: 'Promise 1',
            parent: null,
            children: null,
            state: 'created',
            value: null,
            reason: null,
            createdAt: Date.now(),
            hasStack: false,
          },
        ],
      });
    });

    inner.afterEach(function () {
      respondWith('promise:releasePromises', false);
    });

    test('dragging the navigation handle resizes the navigation', async function (assert) {
      await visit('/promise-tree');

      let start = await drag(NAV_HANDLE, navWidth, 200, 40);

      assert.strictEqual(navWidth(), start + 40);
    });

    test('dragging the object inspector handle resizes the object inspector', async function (assert) {
      await visit('/promise-tree');
      await click('.object-inspector-toggle');

      let container = find(INSPECTOR_HANDLE).parentNode;
      let start = await drag(
        INSPECTOR_HANDLE,
        inspectorWidth,
        container.offsetWidth - 300,
        -40,
      );

      assert.strictEqual(inspectorWidth(), start + 40);
    });

    test('the navigation keeps its dragged width after collapse and expand', async function (assert) {
      await visit('/promise-tree');

      let start = await drag(NAV_HANDLE, navWidth, 200, 40);

      await click('.navigation-toggle');
      await click('.navigation-toggle');

      assert.strictEqual(navWidth(), start + 40);
    });

    test('dragging a column handle resizes the list column', async function (assert) {
      await visit('/promise-tree');

      let start = await drag(COLUMN_HANDLE, firstColumnWidth, 100, 30);

      assert.strictEqual(firstColumnWidth(), start + 30);
      assert.true(columnsFitTable(), 'the last column takes the difference');
    });

    test('list columns fit the table after the object inspector opens', async function (assert) {
      await visit('/promise-tree');

      assert.true(columnsFitTable(), 'the columns fit at the start');

      await click('.object-inspector-toggle');
      await waitUntil(columnsFitTable, { timeout: 1000 }).catch(() => {});

      assert.true(
        columnsFitTable(),
        `the columns (${columnsWidth()}px) fit the table (${tableWidth()}px)`,
      );
    });

    test('list columns fit the table after the navigation is dragged', async function (assert) {
      await visit('/promise-tree');
      let start = await drag(NAV_HANDLE, navWidth, 200, 60);

      assert.strictEqual(navWidth(), start + 60, 'the navigation is wider');

      await waitUntil(columnsFitTable, { timeout: 1000 }).catch(() => {});

      assert.true(
        columnsFitTable(),
        `the columns (${columnsWidth()}px) fit the table (${tableWidth()}px)`,
      );
    });
  });
});
