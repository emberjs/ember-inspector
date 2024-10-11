import { click, fillIn, findAll, settled, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupTestAdapter, respondWith, sendMessage } from '../test-adapter';

function getFilters() {
  return [{ name: 'isNew', desc: 'New' }];
}

function getModelTypes() {
  return [
    {
      name: 'App.Post',
      count: 2,
      columns: [
        { name: 'id', desc: 'Id' },
        { name: 'title', desc: 'Title' },
        { name: 'body', desc: 'Body' },
      ],
      objectId: 'post-type',
    },
    {
      name: 'App.Comment',
      count: 1,
      columns: [
        { name: 'id', desc: 'Id' },
        { name: 'title', desc: 'Title' },
        { name: 'content', desc: 'Content' },
      ],
      objectId: 'comment-type',
    },
  ];
}

function recordFactory(
  { objectId, ...attrs },
  filterValues = { isNew: false },
) {
  filterValues = filterValues || { isNew: false };
  let searchKeywords = [];
  for (let key in attrs) {
    searchKeywords.push(attrs[key]);
  }
  return {
    objectId,
    columnValues: attrs,
    filterValues,
    searchKeywords,
  };
}

function getRecords(type) {
  if (type === 'post-type') {
    return [
      recordFactory({
        objectId: 'post-1',
        id: 1,
        title: 'My Post',
        body: 'This is my first post',
      }),
      recordFactory(
        { objectId: 'post-2', id: 2, title: 'Hello', body: '' },
        { isNew: true },
      ),
    ];
  }

  if (type === 'comment-type') {
    return [
      recordFactory({
        objectId: 'comment-2',
        id: 2,
        title: 'I am confused',
        content: 'I have no idea what im doing',
      }),
    ];
  }

  return [];
}

module('Data Tab', function (outer) {
  setupTestAdapter(outer);
  setupApplicationTest(outer);

  module('Model Types', function (inner) {
    inner.afterEach(function () {
      respondWith('data:releaseModelTypes', false);
    });

    test('Model types are successfully listed and bound', async function (assert) {
      respondWith('data:getModelTypes', {
        type: 'data:modelTypesAdded',
        modelTypes: getModelTypes(),
      });

      await visit('/data/model-types');

      assert.dom('.js-model-type').exists({ count: 2 });

      // they should be sorted alphabetically
      assert.dom(findAll('.js-model-type-name')[0]).hasText('App.Comment');
      assert.dom(findAll('.js-model-type-name')[1]).hasText('App.Post');

      assert.dom(findAll('.js-model-type-count')[0]).hasText('1');
      assert.dom(findAll('.js-model-type-count')[1]).hasText('2');

      await sendMessage({
        type: 'data:modelTypesUpdated',
        modelTypes: [
          {
            name: 'App.Post',
            count: 3,
            objectId: 'post-type',
          },
        ],
      });

      // ember-table doesn't render synchronously, await
      await settled();

      assert.dom(findAll('.js-model-type-name')[0]).hasText('App.Comment');
      assert.dom(findAll('.js-model-type-name')[1]).hasText('App.Post');

      assert.dom(findAll('.js-model-type-count')[0]).hasText('1');
      assert.dom(findAll('.js-model-type-count')[1]).hasText('3');
    });

    test('Hiding empty model types', async function (assert) {
      respondWith('data:getModelTypes', {
        type: 'data:modelTypesAdded',
        modelTypes: [
          ...getModelTypes(),
          {
            name: 'App.Author',
            count: 0,
            columns: [
              { name: 'id', desc: 'Id' },
              { name: 'name', desc: 'Name' },
            ],
            objectId: 'author-type',
          },
        ],
      });

      await visit('/data/model-types');

      assert.dom('.js-model-type').exists({ count: 3 });

      // they should be sorted alphabetically
      assert.dom(findAll('.js-model-type-name')[0]).hasText('App.Author');
      assert.dom(findAll('.js-model-type-name')[1]).hasText('App.Comment');
      assert.dom(findAll('.js-model-type-name')[2]).hasText('App.Post');

      assert.dom(findAll('.js-model-type-count')[0]).hasText('0');
      assert.dom(findAll('.js-model-type-count')[1]).hasText('1');
      assert.dom(findAll('.js-model-type-count')[2]).hasText('2');

      // Make one model type have a count of 0
      await sendMessage({
        type: 'data:modelTypesUpdated',
        modelTypes: [
          {
            name: 'App.Comment',
            count: 0,
            objectId: 'comment-type',
          },
        ],
      });

      // ember-table doesn't render synchronously, await
      await settled();

      assert
        .dom('.js-model-type')
        .exists({ count: 3 }, 'All models are present');

      assert.dom(findAll('.js-model-type-name')[0]).hasText('App.Author');
      assert.dom(findAll('.js-model-type-name')[1]).hasText('App.Comment');
      assert.dom(findAll('.js-model-type-name')[2]).hasText('App.Post');

      assert.dom(findAll('.js-model-type-count')[0]).hasText('0');
      assert.dom(findAll('.js-model-type-count')[1]).hasText('0');
      assert.dom(findAll('.js-model-type-count')[2]).hasText('2');

      // Hide empty models
      await click('[data-test-options-hideEmptyModelTypes]');

      assert
        .dom('.js-model-type')
        .exists({ count: 1 }, 'Only non-empty models are present');

      assert.dom(findAll('.js-model-type-name')[0]).hasText('App.Post');
      assert.dom(findAll('.js-model-type-count')[0]).hasText('2');

      // Show empty models
      await click('[data-test-options-hideEmptyModelTypes]');

      assert
        .dom('.js-model-type')
        .exists({ count: 3 }, 'All models are present');

      assert.dom(findAll('.js-model-type-name')[0]).hasText('App.Author');
      assert.dom(findAll('.js-model-type-name')[1]).hasText('App.Comment');
      assert.dom(findAll('.js-model-type-name')[2]).hasText('App.Post');

      assert.dom(findAll('.js-model-type-count')[0]).hasText('0');
      assert.dom(findAll('.js-model-type-count')[1]).hasText('0');
      assert.dom(findAll('.js-model-type-count')[2]).hasText('2');
    });

    test('Order by record count', async function (assert) {
      respondWith('data:getModelTypes', {
        type: 'data:modelTypesAdded',
        modelTypes: getModelTypes(),
      });

      await visit('/data/model-types');

      assert.dom(findAll('.js-model-type-name')[0]).hasText('App.Comment');
      assert.dom(findAll('.js-model-type-name')[1]).hasText('App.Post');

      // Order models by record count.
      await click('[data-test-options-orderByRecordCount]');

      assert.dom(findAll('.js-model-type-name')[0]).hasText('App.Post');
      assert.dom(findAll('.js-model-type-name')[1]).hasText('App.Comment');

      // Don't order models by record count.
      await click('[data-test-options-orderByRecordCount]');

      assert.dom(findAll('.js-model-type-name')[0]).hasText('App.Comment');
      assert.dom(findAll('.js-model-type-name')[1]).hasText('App.Post');
    });

    test('Reload', async function (assert) {
      respondWith('data:getModelTypes', {
        type: 'data:modelTypesAdded',
        modelTypes: [],
      });

      await visit('/data/model-types');

      assert.dom('.js-model-type').doesNotExist();

      respondWith(
        'data:getModelTypes',
        ({ applicationId, applicationName }) => ({
          type: 'data:modelTypesAdded',
          applicationId,
          applicationName,
          modelTypes: getModelTypes(),
        }),
      );

      await click('[data-test-reload-container-btn]');

      assert.dom('.js-model-type').exists({ count: 2 });
    });

    test('Can inspect store in data pane', async function (assert) {
      respondWith('data:getModelTypes', {
        type: 'data:modelTypesAdded',
        modelTypes: getModelTypes(),
      });

      await visit('/data/model-types');

      respondWith('objectInspector:inspectByContainerLookup', ({ name }) => {
        assert.strictEqual(name, 'service:store');
        return false;
      });

      await click('[data-test-inspect-store]');
    });
  });

  module('Records', function (inner) {
    inner.beforeEach(function () {
      respondWith('data:getModelTypes', {
        type: 'data:modelTypesAdded',
        modelTypes: getModelTypes(),
      });

      respondWith('data:getFilters', {
        type: 'data:filters',
        filters: getFilters(),
      });

      respondWith('data:getRecords', ({ objectId }) => ({
        type: 'data:recordsAdded',
        records: getRecords(objectId),
      }));
    });

    inner.afterEach(function () {
      respondWith('data:releaseModelTypes', false);
      respondWith('data:releaseRecords', false);
    });

    test('Records are successfully listed and bound', async function (assert) {
      await visit('/data/model-types');

      await click(findAll('.js-model-type a')[1]);

      let columns = findAll('[data-test-table-header-column]');
      assert.dom(columns[0]).includesText('Id');
      assert.dom(columns[1]).includesText('Title');
      assert.dom(columns[2]).includesText('Body');

      let recordRows = findAll('[data-test-table-row]');
      assert.strictEqual(recordRows.length, 2);

      let firstRow = recordRows[0];
      let firstRowColumns = firstRow.querySelectorAll('[data-test-table-cell]');
      assert.dom(firstRowColumns[0]).hasText('1');
      assert.dom(firstRowColumns[1]).hasText('My Post');
      assert.dom(firstRowColumns[2]).hasText('This is my first post');

      let secondRow = recordRows[1];
      let secondRowColumns = secondRow.querySelectorAll(
        '[data-test-table-cell]',
      );
      assert.dom(secondRowColumns[0]).hasText('2');
      assert.dom(secondRowColumns[1]).hasText('Hello');
      assert.dom(secondRowColumns[2]).hasText('');

      await sendMessage({
        type: 'data:modelTypesUpdated',
        modelTypes: [
          {
            objectId: 'post-type',
            name: 'App.Post',
            count: 3,
          },
        ],
      });

      await sendMessage({
        type: 'data:recordsAdded',
        records: [
          recordFactory(
            {
              objectId: 'post-3',
              id: 3,
              title: 'Added Post',
              body: 'I am new here',
            },
            {
              isNew: true,
            },
          ),
        ],
      });

      // ember-table doesn't render synchronously, await
      await settled();

      recordRows = findAll('[data-test-table-row]');
      assert.strictEqual(recordRows.length, 3);

      firstRow = recordRows[0];
      firstRowColumns = firstRow.querySelectorAll('[data-test-table-cell]');
      assert.dom(firstRowColumns[0]).hasText('1');
      assert.dom(firstRowColumns[1]).hasText('My Post');
      assert.dom(firstRowColumns[2]).hasText('This is my first post');

      secondRow = recordRows[1];
      secondRowColumns = secondRow.querySelectorAll('[data-test-table-cell]');
      assert.dom(secondRowColumns[0]).hasText('2');
      assert.dom(secondRowColumns[1]).hasText('Hello');
      assert.dom(secondRowColumns[2]).hasText('');

      let thirdRow = recordRows[2];
      let thirdRowColumns = thirdRow.querySelectorAll('[data-test-table-cell]');
      assert.dom(thirdRowColumns[0]).hasText('3');
      assert.dom(thirdRowColumns[1]).hasText('Added Post');
      assert.dom(thirdRowColumns[2]).hasText('I am new here');

      await sendMessage({
        type: 'data:recordsUpdated',
        records: [
          recordFactory({
            objectId: 'post-3',
            id: 3,
            title: 'Modified Post',
            body: 'I am no longer new',
          }),
        ],
      });

      // ember-table doesn't render synchronously, await
      await settled();

      recordRows = findAll('[data-test-table-row]');
      assert.strictEqual(recordRows.length, 3);

      firstRow = recordRows[0];
      firstRowColumns = firstRow.querySelectorAll('[data-test-table-cell]');
      assert.dom(firstRowColumns[0]).hasText('1');
      assert.dom(firstRowColumns[1]).hasText('My Post');
      assert.dom(firstRowColumns[2]).hasText('This is my first post');

      secondRow = recordRows[1];
      secondRowColumns = secondRow.querySelectorAll('[data-test-table-cell]');
      assert.dom(secondRowColumns[0]).hasText('2');
      assert.dom(secondRowColumns[1]).hasText('Hello');
      assert.dom(secondRowColumns[2]).hasText('');

      thirdRow = recordRows[2];
      thirdRowColumns = thirdRow.querySelectorAll('[data-test-table-cell]');
      assert.dom(thirdRowColumns[0]).hasText('3');
      assert.dom(thirdRowColumns[1]).hasText('Modified Post');
      assert.dom(thirdRowColumns[2]).hasText('I am no longer new');

      await sendMessage({
        type: 'data:modelTypesUpdated',
        modelTypes: [
          {
            objectId: 'post-type',
            name: 'App.Post',
            count: 2,
          },
        ],
      });

      await sendMessage({
        type: 'data:recordsRemoved',
        index: 2,
        count: 1,
      });

      // ember-table doesn't render synchronously, await
      await settled();

      recordRows = findAll('[data-test-table-row]');
      assert.strictEqual(recordRows.length, 2);

      firstRow = recordRows[0];
      firstRowColumns = firstRow.querySelectorAll('[data-test-table-cell]');
      assert.dom(firstRowColumns[0]).hasText('1');
      assert.dom(firstRowColumns[1]).hasText('My Post');
      assert.dom(firstRowColumns[2]).hasText('This is my first post');

      secondRow = recordRows[1];
      secondRowColumns = secondRow.querySelectorAll('[data-test-table-cell]');
      assert.dom(secondRowColumns[0]).hasText('2');
      assert.dom(secondRowColumns[1]).hasText('Hello');
      assert.dom(secondRowColumns[2]).hasText('');
    });

    test('Filtering records', async function (assert) {
      await visit('/data/model-types');

      await click(findAll('.js-model-type a')[1]);

      let rows = findAll('[data-test-table-row]');
      assert.strictEqual(rows.length, 2);
      let filters = findAll('.js-filter');
      assert.strictEqual(filters.length, 2);
      let newFilter = [...filters].find(
        (e) => e.textContent.indexOf('New') > -1,
      );
      await click(newFilter);

      rows = findAll('[data-test-table-row]');
      assert.strictEqual(rows.length, 1);
      assert.dom(rows[0].querySelector('[data-test-table-cell]')).hasText('2');
    });

    test('Searching records', async function (assert) {
      await visit('/data/model-types');

      await click(findAll('.js-model-type a')[1]);

      let rows = findAll('[data-test-table-row]');
      assert.strictEqual(rows.length, 2);

      await fillIn('.js-records-search input', 'Hello');

      rows = findAll('[data-test-table-row]');
      assert.strictEqual(rows.length, 1);
      assert.dom(rows[0].querySelector('[data-test-table-cell]')).hasText('2');

      await fillIn('.js-records-search input', 'my first post');

      rows = findAll('[data-test-table-row]');
      assert.strictEqual(rows.length, 1);
      assert.dom(rows[0].querySelector('[data-test-table-cell]')).hasText('1');

      await fillIn('.js-records-search input', '');

      rows = findAll('[data-test-table-row]');
      assert.strictEqual(rows.length, 2);
    });

    test('It should clear the search filter when the clear button is clicked', async function (assert) {
      await visit('/data/model-types');

      await click(findAll('.js-model-type a')[1]);

      let rows = findAll('[data-test-table-row]');
      assert.strictEqual(rows.length, 2);

      await fillIn('.js-records-search input', 'Hello');

      rows = findAll('[data-test-table-row]');
      assert.strictEqual(rows.length, 1);

      await click('[data-test-search-field-clear-button]');
      rows = findAll('[data-test-table-row]');
      assert.strictEqual(rows.length, 2);
    });

    test('Columns successfully updated when switching model types', async function (assert) {
      await visit('/data/model-types/App.Post/records');
      let columns = findAll('[data-test-table-header-column]');
      assert.dom(columns[columns.length - 1]).includesText('Body');

      respondWith('data:getFilters', {
        type: 'data:filters',
        filters: getFilters(),
      });

      respondWith('data:getRecords', ({ objectId }) => ({
        type: 'data:recordsAdded',
        records: getRecords(objectId),
      }));

      await visit('/data/model-types/App.Comment/records');
      columns = findAll('[data-test-table-header-column]');
      assert.dom(columns[columns.length - 1]).includesText('Content');
    });
  });
});
