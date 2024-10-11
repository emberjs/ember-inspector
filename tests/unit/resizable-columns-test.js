import ResizableColumns from 'ember-inspector/libs/resizable-columns';
import { module, test } from 'qunit';
const { keys } = Object;

let storage;

function getOptions() {
  return {
    key: 'my-key',
    tableWidth: 30,
    minWidth: 5,
    storage: {
      setItem(key, value) {
        storage[key] = value;
      },
      getItem(key) {
        return storage[key];
      },
      removeItem(key) {
        delete storage[key];
      },
      keys() {
        return keys(storage);
      },
    },
    columnSchema: [
      {
        id: '1',
        name: 'Column 1',
        visible: true,
      },
      {
        id: '2',
        name: 'Column 2',
        visible: true,
      },
      {
        id: '3',
        name: 'Column 3',
        visible: true,
      },
    ],
  };
}

module('Unit | Lib | ResizableColumns', function (hooks) {
  hooks.beforeEach(function () {
    storage = {};
    this.options = getOptions();
  });

  hooks.afterEach(function () {
    storage = null;
  });

  test('calculates the correct width', function (assert) {
    let resizableColumns = new ResizableColumns(this.options);
    resizableColumns.build();
    assert.strictEqual(resizableColumns.columns.length, 3, 'shows all columns');

    let column = resizableColumns.columns[0];
    assert.strictEqual(column.id, '1', 'correct first column id');
    assert.strictEqual(column.name, 'Column 1', 'correct first column name');
    assert.strictEqual(column.width, 10, 'correct first column width');

    column = resizableColumns.columns[1];
    assert.strictEqual(column.id, '2', 'correct second column id');
    assert.strictEqual(column.name, 'Column 2', 'correct second column name');
    assert.strictEqual(column.width, 10, 'correct second colum width');

    column = resizableColumns.columns[2];
    assert.strictEqual(column.id, '3', 'correct third column id');
    assert.strictEqual(column.name, 'Column 3', 'correct third column name');
    assert.strictEqual(column.width, 10, 'correct first column width');
  });

  test('updates the width correctly', function (assert) {
    let resizableColumns = new ResizableColumns(this.options);
    resizableColumns.build();

    resizableColumns.updateColumnWidth('1', 5);
    assert.strictEqual(
      resizableColumns.columns[0].width,
      5,
      'first column should have the correct width',
    );
    assert.strictEqual(
      resizableColumns.columns[1].width,
      10,
      'second column should have the correct width',
    );
    assert.strictEqual(
      resizableColumns.columns[2].width,
      15,
      'last column should have the correct width',
    );

    resizableColumns.updateColumnWidth('1', 15);
    assert.strictEqual(
      resizableColumns.columns[0].width,
      15,
      'first column should have the correct width',
    );
    assert.strictEqual(
      resizableColumns.columns[1].width,
      10,
      'second column should have the correct width',
    );
    assert.strictEqual(
      resizableColumns.columns[2].width,
      5,
      'last column should have the correct width',
    );

    // Check if it caches the updated widths
    resizableColumns = new ResizableColumns(this.options);
    resizableColumns.build();
    assert.strictEqual(
      resizableColumns.columns[0].width,
      15,
      'first column should have the correct width',
    );
    assert.strictEqual(
      resizableColumns.columns[1].width,
      10,
      'second column should have the correct width',
    );
    assert.strictEqual(
      resizableColumns.columns[2].width,
      5,
      'last column should have the correct width',
    );

    resizableColumns.resetWidths();
    assert.strictEqual(
      resizableColumns.columns[0].width,
      10,
      'first column should have the correct width',
    );
    assert.strictEqual(
      resizableColumns.columns[1].width,
      10,
      'second column should have the correct width',
    );
    assert.strictEqual(
      resizableColumns.columns[2].width,
      10,
      'last column should have the correct width',
    );

    // Table width upate
    resizableColumns.setTableWidth(15);
    assert.strictEqual(
      resizableColumns.columns[0].width,
      5,
      'first column should have the correct width',
    );
    assert.strictEqual(
      resizableColumns.columns[1].width,
      5,
      'second column should have the correct width',
    );
    assert.strictEqual(
      resizableColumns.columns[2].width,
      5,
      'last column should have the correct width',
    );
  });

  test('uses the correct cache key', function (assert) {
    let resizableColumns = new ResizableColumns(this.options);
    resizableColumns.build();
    assert.strictEqual(
      this.options.storage.keys().length,
      1,
      'Only uses one key',
    );
    assert.strictEqual(
      this.options.storage.keys()[0],
      'list__my-key',
      'Uses the correct key',
    );
  });

  test('shows/hides the correct columns', function (assert) {
    this.options.columnSchema[2].visible = false;
    let resizableColumns = new ResizableColumns(this.options);
    resizableColumns.build();

    assert.deepEqual(
      resizableColumns.columns.filterBy('visible').mapBy('id'),
      ['1', '2'],
      'shows/hides according to schema',
    );
    assert.deepEqual(resizableColumns.getColumnVisibility().mapBy('visible'), [
      true,
      true,
      false,
    ]);

    resizableColumns.toggleVisibility('3');
    assert.deepEqual(
      resizableColumns.columns.filterBy('visible').mapBy('id'),
      ['1', '2', '3'],
      'toggles the third column correctly',
    );
    assert.deepEqual(resizableColumns.getColumnVisibility().mapBy('visible'), [
      true,
      true,
      true,
    ]);

    resizableColumns.toggleVisibility('1');
    assert.deepEqual(
      resizableColumns.columns.filterBy('visible').mapBy('id'),
      ['2', '3'],
      'toggles the first column correctly',
    );
    assert.deepEqual(resizableColumns.getColumnVisibility().mapBy('visible'), [
      false,
      true,
      true,
    ]);

    // Confirm correct caching
    resizableColumns = new ResizableColumns(this.options);
    resizableColumns.build();
    assert.deepEqual(
      resizableColumns.columns.filterBy('visible').mapBy('id'),
      ['2', '3'],
      'caching overrides schema visibility settings',
    );
    assert.deepEqual(resizableColumns.getColumnVisibility().mapBy('visible'), [
      false,
      true,
      true,
    ]);
  });

  test("resets cache correctly if schema doesn't match cache", function (assert) {
    this.options.storage.removeItem = (key) => {
      assert.strictEqual(key, 'list__my-key', 'cache was cleared');
    };
    let resizableColumns = new ResizableColumns(this.options);
    resizableColumns.build();
    this.options.columnSchema = [
      {
        id: '1',
        name: 'Column 1',
        visible: true,
      },
    ];
    resizableColumns = new ResizableColumns(this.options);
    resizableColumns.build();
  });

  test('clears expired cache', function (assert) {
    let sixtyDaysAgo = 1000 * 60 * 60 * 24 * 30 * 2;
    storage['list__my-key'] = { updatedAt: Date.now() - sixtyDaysAgo };
    this.options.storage.removeItem = (key) => {
      assert.strictEqual(key, 'list__my-key', 'cache was cleared');
    };
    let resizableColumns = new ResizableColumns(this.options);
    resizableColumns.build();
  });
});
