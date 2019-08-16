import {
  click,
  fillIn,
  findAll,
  settled,
  visit
} from '@ember/test-helpers';
import { guidFor } from '@ember/object/internals';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { triggerPort } from '../helpers/trigger-port';
import LocalStorageService from 'ember-inspector/services/storage/local';
import {
  HIDE_EMPTY_MODELS_KEY,
  ORDER_MODELS_BY_COUNT_KEY
} from 'ember-inspector/utils/local-storage-keys';

let port, name;

module('Data Tab', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    port = this.owner.lookup('port:main');
    port.reopen({
      init() { },
      send(n, m) {
        name = n;
        if (name === 'data:getModelTypes') {
          this.trigger('data:modelTypesAdded', { modelTypes: modelTypes() });
        }
        if (name === 'data:getRecords') {
          this.trigger('data:recordsAdded', { records: records(m.objectId) });
        }
        if (name === 'data:getFilters') {
          this.trigger('data:filters', { filters: getFilters() });
        }
      }
    });
  });

  hooks.afterEach(function () {
    name = null;
    // This is to ensure settings in Storage do not persist across multiple test runs.
    let storageService = this.owner.lookup(`service:storage/${LocalStorageService.STORAGE_TYPE_TO_USE}`);

    storageService.removeItem(HIDE_EMPTY_MODELS_KEY);
    storageService.removeItem(ORDER_MODELS_BY_COUNT_KEY);
  });

  function modelTypeFactory(options) {
    return {
      name: options.name,
      count: options.count,
      columns: options.columns,
      objectId: options.name
    };
  }

  function getFilters() {
    return [{ name: 'isNew', desc: 'New' }];
  }

  function modelTypes() {
    return [
      modelTypeFactory({
        name: 'App.Post',
        count: 2,
        columns: [{ name: 'id', desc: 'Id' }, { name: 'title', desc: 'Title' }, { name: 'body', desc: 'Body' }]
      }),
      modelTypeFactory({
        name: 'App.Comment',
        count: 1,
        columns: [{ name: 'id', desc: 'Id' }, { name: 'title', desc: 'Title' }, { name: 'content', desc: 'Content' }]
      })
    ];
  }

  function recordFactory(attr, filterValues) {
    filterValues = filterValues || { isNew: false };
    let searchKeywords = [];
    for (let i in attr) {
      searchKeywords.push(attr[i]);
    }
    let object = EmberObject.create();
    return {
      columnValues: attr,
      objectId: attr.objectId || guidFor(object),
      filterValues,
      searchKeywords
    };
  }

  function records(type) {
    if (type === 'App.Post') {
      return [
        recordFactory({ id: 1, title: 'My Post', body: 'This is my first post' }),
        recordFactory({ id: 2, title: 'Hello', body: '' }, { isNew: true })
      ];
    } else if (type === 'App.Comment') {
      return [
        recordFactory({ id: 2, title: 'I am confused', content: 'I have no idea what im doing' })
      ];
    }
  }

  test('Model types are successfully listed and bound', async function t(assert) {
    await visit('/data/model-types');

    assert.dom('.js-model-type').exists({ count: 2 });
    // they should be sorted alphabetically
    assert.dom(findAll('.js-model-type-name')[0]).hasText('App.Comment');
    assert.dom(findAll('.js-model-type-name')[1]).hasText('App.Post');

    assert.dom(findAll('.js-model-type-count')[0]).hasText('1');
    assert.dom(findAll('.js-model-type-count')[1]).hasText('2');

    await triggerPort(this, 'data:modelTypesUpdated', {
      modelTypes: [
        modelTypeFactory({ name: 'App.Post', count: 3 })
      ]
    });
    assert.dom(findAll('.js-model-type-count')[1]).hasText('3');
  });

  test('Records are successfully listed and bound', async function t(assert) {
    await visit('/data/model-types');

    await click(findAll('.js-model-type a')[1]);

    let columns = findAll('[data-test-table-header-column]');
    assert.dom(columns[0]).includesText('Id');
    assert.dom(columns[1]).includesText('Title');
    assert.dom(columns[2]).includesText('Body');

    let recordRows = findAll('[data-test-table-row]');
    assert.equal(recordRows.length, 2);

    let firstRow = recordRows[0];
    let firstRowColumns = firstRow.querySelectorAll('[data-test-table-cell]');
    assert.dom(firstRowColumns[0]).hasText('1');
    assert.dom(firstRowColumns[1]).hasText('My Post');
    assert.dom(firstRowColumns[2]).hasText('This is my first post');

    let secondRow = recordRows[1];
    let secondRowColumns = secondRow.querySelectorAll('[data-test-table-cell]');
    assert.dom(secondRowColumns[0]).hasText('2');
    assert.dom(secondRowColumns[1]).hasText('Hello');
    assert.dom(secondRowColumns[2]).hasText('');

    await triggerPort(this, 'data:recordsAdded', {
      records: [recordFactory({ objectId: 'new-post', id: 3, title: 'Added Post', body: 'I am new here' })]
    });

    let addedRow = findAll('[data-test-table-row]')[2];
    let addedRowColumns = addedRow.querySelectorAll('[data-test-table-cell]');
    assert.dom(addedRowColumns[0]).hasText('3');
    assert.dom(addedRowColumns[1]).hasText('Added Post');
    assert.dom(addedRowColumns[2]).hasText('I am new here');

    await triggerPort(this, 'data:recordsUpdated', {
      records: [recordFactory({ objectId: 'new-post', id: 3, title: 'Modified Post', body: 'I am no longer new' })]
    });

    let rows = findAll('[data-test-table-row]');
    let modifiedRow = rows[rows.length - 1];
    let modifiedRowColumns = modifiedRow.querySelectorAll('[data-test-table-cell]');
    assert.dom(modifiedRowColumns[0]).hasText('3');
    assert.dom(modifiedRowColumns[1]).hasText('Modified Post');
    assert.dom(modifiedRowColumns[2]).hasText('I am no longer new');

    await triggerPort(this, 'data:recordsRemoved', {
      index: 2,
      count: 1
    });
    await settled();

    assert.dom('[data-test-table-row]').exists({ count: 2 });
    rows = findAll('[data-test-table-row]');
    let lastRow = rows[rows.length - 1];
    let lastRowColumns = lastRow.querySelectorAll('[data-test-table-cell]');
    assert.dom(lastRowColumns[0]).hasText('2', 'Records successfully removed.');
  });

  test('Hiding empty model types', async function (assert) {
    assert.expect(3);

    await visit('/data/model-types');

    // Make one model type have a count of 0
    await triggerPort(this, 'data:modelTypesUpdated', {
      modelTypes: [
        modelTypeFactory({ name: 'App.Post', count: 0 })
      ]
    });

    assert.dom('.js-model-type').exists({ count: 2 }, 'All models are present');

    // Hide empty models
    await click('#options-hideEmptyModelTypes');
    assert.dom('.js-model-type').exists({ count: 1 }, 'Only non-empty models are present');

    // Show empty models
    await click('#options-hideEmptyModelTypes');
    assert.dom('.js-model-type').exists({ count: 2 }, 'All models are present again');
  });

  test('Order by record count', async function (assert) {
    assert.expect(6);

    await visit('/data/model-types');

    assert.dom(findAll('.js-model-type-name')[0]).hasText('App.Comment');
    assert.dom(findAll('.js-model-type-name')[1]).hasText('App.Post');

    // Order models by record count.
    await click('#options-orderByRecordCount');

    assert.dom(findAll('.js-model-type-name')[0]).hasText('App.Post');
    assert.dom(findAll('.js-model-type-name')[1]).hasText('App.Comment');

    // Don't order models by record count.
    await click('#options-orderByRecordCount');
    assert.dom(findAll('.js-model-type-name')[0]).hasText('App.Comment');
    assert.dom(findAll('.js-model-type-name')[1]).hasText('App.Post');
  });

  test('Filtering records', async function t(assert) {
    await visit('/data/model-types');

    await click(findAll('.js-model-type a')[1]);

    let rows = findAll('[data-test-table-row]');
    assert.equal(rows.length, 2);
    let filters = findAll('.js-filter');
    assert.equal(filters.length, 2);
    let newFilter = [...filters].find((e) => e.textContent.indexOf('New') > -1);
    await click(newFilter);

    rows = findAll('[data-test-table-row]');
    assert.equal(rows.length, 1);
    assert.dom(rows[0].querySelector('[data-test-table-cell]')).hasText('2');
  });

  test('Searching records', async function t(assert) {
    await visit('/data/model-types');

    await click(findAll('.js-model-type a')[1]);

    let rows = findAll('[data-test-table-row]');
    assert.equal(rows.length, 2);

    await fillIn('.js-records-search input', 'Hello');

    rows = findAll('[data-test-table-row]');
    assert.equal(rows.length, 1);
    assert.dom(rows[0].querySelector('[data-test-table-cell]')).hasText('2');

    await fillIn('.js-records-search input', 'my first post');

    rows = findAll('[data-test-table-row]');
    assert.equal(rows.length, 1);
    assert.dom(rows[0].querySelector('[data-test-table-cell]')).hasText('1');

    await fillIn('.js-records-search input', '');

    rows = findAll('[data-test-table-row]');
    assert.equal(rows.length, 2);
  });

  test("It should clear the search filter when the clear button is clicked", async function (assert) {
    await visit('/data/model-types');
    await click(findAll('.js-model-type a')[1]);

    let rows = findAll('[data-test-table-row]');
    assert.equal(rows.length, 2);

    await fillIn('.js-records-search input', 'Hello');

    rows = findAll('[data-test-table-row]');
    assert.equal(rows.length, 1);

    await click('.js-search-field-clear-button');
    rows = findAll('[data-test-table-row]');
    assert.equal(rows.length, 2);
  });

  test('Columns successfully updated when switching model types', async function t(assert) {
    await visit('/data/model-types/App.Post/records');
    let columns = findAll('[data-test-table-header-column]');
    assert.dom(columns[columns.length - 1]).includesText('Body');
    await visit('/data/model-types/App.Comment/records');
    columns = findAll('[data-test-table-header-column]');
    assert.dom(columns[columns.length - 1]).includesText('Content');
  });

  test("Reload", async function (assert) {
    let types = [], getRecords = [], filters = [];

    port.reopen({
      init() { },
      send(n) {
        name = n;
        if (name === 'data:getModelTypes') {
          this.trigger('data:modelTypesAdded', { modelTypes: types });
        }
        if (name === 'data:getRecords') {
          this.trigger('data:recordsAdded', { records: getRecords });
        }
        if (name === 'data:getFilters') {
          this.trigger('data:filters', { filters });
        }
      }
    });

    await visit('/data/model-types');

    assert.dom('.js-model-type').doesNotExist();
    types = modelTypes();
    getRecords = records('App.Post');
    filters = getFilters();

    await click('.js-reload-container-btn');

    assert.dom('.js-model-type').exists({ count: 2 });
  });
});
