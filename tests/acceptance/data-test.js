import {
  click,
  fillIn,
  findAll,
  settled,
  visit
} from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { registerResponderFor, sendMessage } from '../test-adapter';

function getFilters() {
  return [{ name: 'isNew', desc: 'New' }];
}

function getModelTypes() {
  return [{
    name: 'App.Post',
    count: 2,
    columns: [{ name: 'id', desc: 'Id' }, { name: 'title', desc: 'Title' }, { name: 'body', desc: 'Body' }],
    objectId: 'post-type'
  }, {
    name: 'App.Comment',
    count: 1,
    columns: [{ name: 'id', desc: 'Id' }, { name: 'title', desc: 'Title' }, { name: 'content', desc: 'Content' }],
    objectId: 'comment-type'
  }];
}

function recordFactory({ objectId, ...attrs }, filterValues = { isNew: false }) {
  filterValues = filterValues || { isNew: false };
  let searchKeywords = [];
  for (let key in attrs) {
    searchKeywords.push(attrs[key]);
  }
  return {
    objectId,
    columnValues: attrs,
    filterValues,
    searchKeywords
  };
}

function getRecords(type) {
  if (type === 'post-type') {
    return [
      recordFactory({ objectId: 'post-1', id: 1, title: 'My Post', body: 'This is my first post' }),
      recordFactory({ objectId: 'post-2', id: 2, title: 'Hello', body: '' }, { isNew: true })
    ];
  }

  if (type === 'comment-type') {
    return [
      recordFactory({ objectId: 'comment-2', id: 2, title: 'I am confused', content: 'I have no idea what im doing' })
    ];
  }

  return [];
}

module('Data Tab', function(hooks) {
  hooks.beforeEach(function() {
    registerResponderFor('check-version', () => false);

    registerResponderFor('general:applicationBooted', {
      type: 'general:applicationBooted',
      applicationId: 'my-app',
      applicationName: 'My App',
      booted: true
    });

    registerResponderFor('app-picker-loaded', {
      type: 'apps-loaded',
      apps: [{
        applicationId: 'my-app',
        applicationName: 'My App'
      }]
    });

    registerResponderFor('app-selected', () => false);

    registerResponderFor('deprecation:getCount', ({ applicationId, applicationName }) => ({
      type: 'deprecation:count',
      applicationId,
      applicationName,
      count: 0
    }));
  });

  setupApplicationTest(hooks);

  // hooks.beforeEach(function() {
  //   port = this.owner.lookup('service:port');
  //   port.reopen({
  //     init() {},
  //     send(n, m) {
  //       name = n;
  //       if (name === 'data:getModelTypes') {
  //         this.trigger('data:modelTypesAdded', { modelTypes: modelTypes() });
  //       }
  //       if (name === 'data:getRecords') {
  //         this.trigger('data:recordsAdded', { records: records(m.objectId) });
  //       }
  //       if (name === 'data:getFilters') {
  //         this.trigger('data:filters', { filters: getFilters() });
  //       }
  //     }
  //   });
  // });

  // hooks.afterEach(function() {
  //   name = null;
  // });

  test('Model types are successfully listed and bound', async function(assert) {
    registerResponderFor('data:getModelTypes', ({ applicationId, applicationName }) => ({
      type: 'data:modelTypesAdded',
      applicationId,
      applicationName,
      modelTypes: getModelTypes()
    }));

    // Once at the end
    registerResponderFor('data:releaseModelTypes', () => false);

    await visit('/data/model-types');

    assert.dom('.js-model-type').exists({ count: 2 });

    // they should be sorted alphabetically
    assert.dom(findAll('.js-model-type-name')[0]).hasText('App.Comment');
    assert.dom(findAll('.js-model-type-name')[1]).hasText('App.Post');

    assert.dom(findAll('.js-model-type-count')[0]).hasText('1');
    assert.dom(findAll('.js-model-type-count')[1]).hasText('2');

    await sendMessage({
      type: 'data:modelTypesUpdated',
      applicationId: 'my-app',
      applicationName: 'My App',
      modelTypes: [{
        name: 'App.Post',
        count: 3,
        objectId: 'post-type'
      }]
    });

    assert.dom(findAll('.js-model-type-name')[0]).hasText('App.Comment');
    assert.dom(findAll('.js-model-type-name')[1]).hasText('App.Post');

    assert.dom(findAll('.js-model-type-count')[0]).hasText('1');
    assert.dom(findAll('.js-model-type-count')[1]).hasText('3');
  });

  test('Hiding empty model types', async function(assert) {
    registerResponderFor('data:getModelTypes', ({ applicationId, applicationName }) => ({
      type: 'data:modelTypesAdded',
      applicationId,
      applicationName,
      modelTypes: [
        ...getModelTypes(),
        {
          name: 'App.Author',
          count: 0,
          columns: [{ name: 'id', desc: 'Id' }, { name: 'name', desc: 'Name' }],
          objectId: 'author-type'
        }
      ]
    }));

    // Once at the end
    registerResponderFor('data:releaseModelTypes', () => false);

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
      applicationId: 'my-app',
      applicationName: 'My App',
      modelTypes: [{
        name: 'App.Comment',
        count: 0,
        objectId: 'comment-type'
      }]
    });

    assert.dom('.js-model-type').exists({ count: 3 }, 'All models are present');

    assert.dom(findAll('.js-model-type-name')[0]).hasText('App.Author');
    assert.dom(findAll('.js-model-type-name')[1]).hasText('App.Comment');
    assert.dom(findAll('.js-model-type-name')[2]).hasText('App.Post');

    assert.dom(findAll('.js-model-type-count')[0]).hasText('0');
    assert.dom(findAll('.js-model-type-count')[1]).hasText('0');
    assert.dom(findAll('.js-model-type-count')[2]).hasText('2');

    // Hide empty models
    await click('#options-hideEmptyModelTypes');

    assert.dom('.js-model-type').exists({ count: 1 }, 'Only non-empty models are present');

    assert.dom(findAll('.js-model-type-name')[0]).hasText('App.Post');
    assert.dom(findAll('.js-model-type-count')[0]).hasText('2');

    // Show empty models
    await click('#options-hideEmptyModelTypes');

    assert.dom('.js-model-type').exists({ count: 3 }, 'All models are present');

    assert.dom(findAll('.js-model-type-name')[0]).hasText('App.Author');
    assert.dom(findAll('.js-model-type-name')[1]).hasText('App.Comment');
    assert.dom(findAll('.js-model-type-name')[2]).hasText('App.Post');

    assert.dom(findAll('.js-model-type-count')[0]).hasText('0');
    assert.dom(findAll('.js-model-type-count')[1]).hasText('0');
    assert.dom(findAll('.js-model-type-count')[2]).hasText('2');
  });

  test('Order by record count', async function(assert) {
    registerResponderFor('data:getModelTypes', ({ applicationId, applicationName }) => ({
      type: 'data:modelTypesAdded',
      applicationId,
      applicationName,
      modelTypes: getModelTypes()
    }));

    // Once at the end
    registerResponderFor('data:releaseModelTypes', () => false);

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

  test("Reload", async function(assert) {
    registerResponderFor('data:getModelTypes', ({ applicationId, applicationName }) => ({
      type: 'data:modelTypesAdded',
      applicationId,
      applicationName,
      modelTypes: []
    }));

    // Once at the end
    registerResponderFor('data:releaseModelTypes', () => false);

    await visit('/data/model-types');

    assert.dom('.js-model-type').doesNotExist();

    registerResponderFor('data:getModelTypes', ({ applicationId, applicationName }) => ({
      type: 'data:modelTypesAdded',
      applicationId,
      applicationName,
      modelTypes: getModelTypes()
    }));

    await click('.js-reload-container-btn');

    assert.dom('.js-model-type').exists({ count: 2 });
  });

  test('Records are successfully listed and bound', async function(assert) {
    registerResponderFor('data:getModelTypes', ({ applicationId, applicationName }) => ({
      type: 'data:modelTypesAdded',
      applicationId,
      applicationName,
      modelTypes: getModelTypes()
    }));

    // Once at the end
    registerResponderFor('data:releaseModelTypes', () => false);

    await visit('/data/model-types');

    registerResponderFor('data:getFilters', ({ applicationId, applicationName }) => ({
      type: 'data:filters',
      applicationId,
      applicationName,
      filters: getFilters()
    }));

    registerResponderFor('data:getRecords', ({ applicationId, applicationName, objectId }) => ({
      type: 'data:recordsAdded',
      applicationId,
      applicationName,
      records: getRecords(objectId)
    }));

    // Once at the end
    registerResponderFor('data:releaseRecords', () => false);

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

    await sendMessage({
      type: 'data:modelTypesUpdated',
      applicationId: 'my-app',
      applicationName: 'My App',
      modelTypes: [{
        objectId: 'post-type',
        name: 'App.Post',
        count: 3
      }]
    });

    await sendMessage({
      type: 'data:recordsAdded',
      applicationId: 'my-app',
      applicationName: 'My App',
      records: [recordFactory({
        objectId: 'post-3',
        id: 3,
        title: 'Added Post',
        body: 'I am new here'
      }, {
        isNew: true
      })]
    });

    // Why is this needed?
    await settled();

    recordRows = findAll('[data-test-table-row]');
    assert.equal(recordRows.length, 3);

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
      applicationId: 'my-app',
      applicationName: 'My App',
      records: [recordFactory({
        objectId: 'post-3',
        id: 3,
        title: 'Modified Post',
        body: 'I am no longer new'
      })]
    });

    recordRows = findAll('[data-test-table-row]');
    assert.equal(recordRows.length, 3);

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
      applicationId: 'my-app',
      applicationName: 'My App',
      modelTypes: [{
        objectId: 'post-type',
        name: 'App.Post',
        count: 2
      }]
    });

    await sendMessage({
      type: 'data:recordsRemoved',
      applicationId: 'my-app',
      applicationName: 'My App',
      index: 2,
      count: 1
    });

    // Why is this needed?
    await settled();

    recordRows = findAll('[data-test-table-row]');
    assert.equal(recordRows.length, 2);

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

  test('Filtering records', async function(assert) {
    registerResponderFor('data:getModelTypes', ({ applicationId, applicationName }) => ({
      type: 'data:modelTypesAdded',
      applicationId,
      applicationName,
      modelTypes: getModelTypes()
    }));

    // Once at the end
    registerResponderFor('data:releaseModelTypes', () => false);

    await visit('/data/model-types');

    registerResponderFor('data:getFilters', ({ applicationId, applicationName }) => ({
      type: 'data:filters',
      applicationId,
      applicationName,
      filters: getFilters()
    }));

    registerResponderFor('data:getRecords', ({ applicationId, applicationName, objectId }) => ({
      type: 'data:recordsAdded',
      applicationId,
      applicationName,
      records: getRecords(objectId)
    }));

    // Once at the end
    registerResponderFor('data:releaseRecords', () => false);

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

  test('Searching records', async function(assert) {
    registerResponderFor('data:getModelTypes', ({ applicationId, applicationName }) => ({
      type: 'data:modelTypesAdded',
      applicationId,
      applicationName,
      modelTypes: getModelTypes()
    }));

    // Once at the end
    registerResponderFor('data:releaseModelTypes', () => false);

    await visit('/data/model-types');

    registerResponderFor('data:getFilters', ({ applicationId, applicationName }) => ({
      type: 'data:filters',
      applicationId,
      applicationName,
      filters: getFilters()
    }));

    registerResponderFor('data:getRecords', ({ applicationId, applicationName, objectId }) => ({
      type: 'data:recordsAdded',
      applicationId,
      applicationName,
      records: getRecords(objectId)
    }));

    // Once at the end
    registerResponderFor('data:releaseRecords', () => false);

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

  test("It should clear the search filter when the clear button is clicked", async function(assert) {
    registerResponderFor('data:getModelTypes', ({ applicationId, applicationName }) => ({
      type: 'data:modelTypesAdded',
      applicationId,
      applicationName,
      modelTypes: getModelTypes()
    }));

    // Once at the end
    registerResponderFor('data:releaseModelTypes', () => false);

    await visit('/data/model-types');

    registerResponderFor('data:getFilters', ({ applicationId, applicationName }) => ({
      type: 'data:filters',
      applicationId,
      applicationName,
      filters: getFilters()
    }));

    registerResponderFor('data:getRecords', ({ applicationId, applicationName, objectId }) => ({
      type: 'data:recordsAdded',
      applicationId,
      applicationName,
      records: getRecords(objectId)
    }));

    // Once at the end
    registerResponderFor('data:releaseRecords', () => false);

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

  test('Columns successfully updated when switching model types', async function(assert) {
    registerResponderFor('data:getModelTypes', ({ applicationId, applicationName }) => ({
      type: 'data:modelTypesAdded',
      applicationId,
      applicationName,
      modelTypes: getModelTypes()
    }));

    // Once at the end
    registerResponderFor('data:releaseModelTypes', () => false);

    registerResponderFor('data:getFilters', ({ applicationId, applicationName }) => ({
      type: 'data:filters',
      applicationId,
      applicationName,
      filters: getFilters()
    }), { count: 2 });

    registerResponderFor('data:getRecords', ({ applicationId, applicationName, objectId }) => ({
      type: 'data:recordsAdded',
      applicationId,
      applicationName,
      records: getRecords(objectId)
    }), { count: 2 });

    // Once at the end
    registerResponderFor('data:releaseRecords', () => false);

    await visit('/data/model-types/App.Post/records');
    let columns = findAll('[data-test-table-header-column]');
    assert.dom(columns[columns.length - 1]).includesText('Body');

    await visit('/data/model-types/App.Comment/records');
    columns = findAll('[data-test-table-header-column]');
    assert.dom(columns[columns.length - 1]).includesText('Content');
  });
});
