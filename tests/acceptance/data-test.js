import { visit, findAll, click, fillIn } from '@ember/test-helpers';
import { guidFor } from '@ember/object/internals';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { triggerPort } from '../helpers/trigger-port';
import wait from 'ember-test-helpers/wait';

let port, name;

module('Data Tab', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    port = this.owner.lookup('port:main');
    port.reopen({
      init() {},
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

  hooks.afterEach(function() {
    name = null;
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

    assert.equal(findAll('.js-model-type').length, 2);
    // they should be sorted alphabetically
    assert.equal(findAll('.js-model-type-name')[0].textContent.trim(), 'App.Comment');
    assert.equal(findAll('.js-model-type-name')[1].textContent.trim(), 'App.Post');

    assert.equal(findAll('.js-model-type-count')[0].textContent.trim(), 1);
    assert.equal(findAll('.js-model-type-count')[1].textContent.trim(), 2);

    await triggerPort(this, 'data:modelTypesUpdated', {
      modelTypes: [
        modelTypeFactory({ name: 'App.Post', count: 3 })
      ]
    });
    assert.equal(findAll('.js-model-type-count')[1].textContent.trim(), 3);
  });

  test('Records are successfully listed and bound', async function t(assert) {
    await visit('/data/model-types');

    await click(findAll('.js-model-type a')[1]);

    let columns = findAll('.js-header-column');
    assert.equal(columns[0].textContent.trim(), 'Id');
    assert.equal(columns[1].textContent.trim(), 'Title');
    assert.equal(columns[2].textContent.trim(), 'Body');

    let recordRows = findAll('.js-record-list-item');
    assert.equal(recordRows.length, 2);

    let firstRow = recordRows[0];
    let firstRowColumns = firstRow.querySelectorAll('.js-record-column');
    assert.equal(firstRowColumns[0].textContent.trim(), 1);
    assert.equal(firstRowColumns[1].textContent.trim(), 'My Post');
    assert.equal(firstRowColumns[2].textContent.trim(), 'This is my first post');

    let secondRow = recordRows[1];
    let secondRowColumns = secondRow.querySelectorAll('.js-record-column');
    assert.equal(secondRowColumns[0].textContent.trim(), 2);
    assert.equal(secondRowColumns[1].textContent.trim(), 'Hello');
    assert.equal(secondRowColumns[2].textContent.trim(), '');

    await triggerPort(this, 'data:recordsAdded', {
      records: [recordFactory({ objectId: 'new-post', id: 3, title: 'Added Post', body: 'I am new here' })]
    });

    let addedRow = findAll('.js-record-list-item')[2];
    let addedRowColumns = addedRow.querySelectorAll('.js-record-column');
    assert.equal(addedRowColumns[0].textContent.trim(), 3);
    assert.equal(addedRowColumns[1].textContent.trim(), 'Added Post');
    assert.equal(addedRowColumns[2].textContent.trim(), 'I am new here');

    await triggerPort(this, 'data:recordsUpdated', {
      records: [recordFactory({ objectId: 'new-post', id: 3, title: 'Modified Post', body: 'I am no longer new' })]
    });

    let rows = findAll('.js-record-list-item');
    let modifiedRow = rows[rows.length - 1];
    let modifiedRowColumns = modifiedRow.querySelectorAll('.js-record-column');
    assert.equal(modifiedRowColumns[0].textContent.trim(), 3);
    assert.equal(modifiedRowColumns[1].textContent.trim(), 'Modified Post');
    assert.equal(modifiedRowColumns[2].textContent.trim(), 'I am no longer new');

    await triggerPort(this, 'data:recordsRemoved', {
      index: 2,
      count: 1
    });
    await wait();

    assert.equal(findAll('.js-record-list-item').length, 2);
    rows = findAll('.js-record-list-item');
    let lastRow = rows[rows.length - 1];
    let lastRowColumns = lastRow.querySelectorAll('.js-record-column');
    assert.equal(lastRowColumns[0].textContent.trim(), 2, 'Records successfully removed.');
  });

  test('Filtering records', async function t(assert) {
    await visit('/data/model-types');

    await click(findAll('.js-model-type a')[1]);

    let rows = findAll('.js-record-list-item');
    assert.equal(rows.length, 2);
    let filters = findAll('.js-filter');
    assert.equal(filters.length, 2);
    let newFilter = [...filters].find((e) => e.textContent.indexOf('New') > -1);
    await click(newFilter);

    rows = findAll('.js-record-list-item');
    assert.equal(rows.length, 1);
    assert.equal(findAll('.js-record-column', rows[0])[0].textContent.trim(), '2');
  });

  test('Searching records', async function t(assert) {
    await visit('/data/model-types');

    await click(findAll('.js-model-type a')[1]);

    let rows = findAll('.js-record-list-item');
    assert.equal(rows.length, 2);

    await fillIn('.js-records-search input', 'Hello');

    rows = findAll('.js-record-list-item');
    assert.equal(rows.length, 1);
    assert.equal(findAll('.js-record-column', rows[0])[0].textContent.trim(), '2');

    await fillIn('.js-records-search input', 'my first post');

    rows = findAll('.js-record-list-item');
    assert.equal(rows.length, 1);
    assert.equal(findAll('.js-record-column', rows[0])[0].textContent.trim(), '1');

    await fillIn('.js-records-search input', '');

    rows = findAll('.js-record-list-item');
    assert.equal(rows.length, 2);
  });

  test("It should clear the search filter when the clear button is clicked", async function(assert) {
    await visit('/data/model-types');
    await click(findAll('.js-model-type a')[1]);

    let rows = findAll('.js-record-list-item');
    assert.equal(rows.length, 2);

    await fillIn('.js-records-search input', 'Hello');

    rows = findAll('.js-record-list-item');
    assert.equal(rows.length, 1);

    await click('.js-search-field-clear-button');
    rows = findAll('.js-record-list-item');
    assert.equal(rows.length, 2);
  });

  test('Columns successfully updated when switching model types', async function t(assert) {
    await visit('/data/model-types/App.Post/records');
    let columns = findAll('.js-header-column');
    assert.equal(columns[columns.length - 1].textContent.trim(), 'Body');
    await visit('/data/model-types/App.Comment/records');
    columns = findAll('.js-header-column');
    assert.equal(columns[columns.length - 1].textContent.trim(), 'Content');
  });
});
