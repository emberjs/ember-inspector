import Component from '@ember/component';
import { run, scheduleOnce } from '@ember/runloop';
import { task, timeout } from 'ember-concurrency';
import ResizableColumns from 'ember-inspector/libs/resizable-columns';
import LocalStorageService from 'ember-inspector/services/storage/local';
import { inject as service } from '@ember/service';
import { readOnly, reads } from '@ember/object/computed';

const CHECK_HTML = '&#10003;';

export default Component.extend({
  /**
   * @property classNames
   * @type {Array}
   */
  classNames: ['list'],

  /**
   * Class to pass to each row in `vertical-collection`.
   *
   * @property itemClass
   * @type {String}
   * @default ''
   */
  itemClass: '',

  /**
   * Layout service used to listen to changes to the application
   * layout such as resizing of the main nav or object inspector.
   *
   * @property layoutService
   * @type {Service}
   */
  layoutService: service('layout'),

  /**
   * Indicate the table's header's height in pixels.
   * Set this to `0` when there's no header.
   *
   * @property headerHeight
   * @type {Number}
   * @default 31
   */
  headerHeight: 31,

  /**
   * The name of the list. Used for `js-` classes added
   * to elements of the list. Also used as the default
   * key for schema caching.
   *
   * @property name
   * @type {String}
   */
  name: null,

  /**
   * Service used for storage. Storage is
   * needed for caching of widths and visibility of columns.
   * The default storage service is local storage however we
   * fall back to memory storage if local storage is disabled (For
   * example as a security setting in Chrome).
   *
   * @property storage
   * @return {Service}
   */
  storage: service(`storage/${LocalStorageService.SUPPORTED ? 'local' : 'memory'}`),

  /**
   * The key used to cache the current schema. Defaults
   * to the list's name.
   *
   * @property storageKey
   * @type {String}
   */
  storageKey: reads('name'),

  /**
   * The schema that contains the list's columns,
   * their ids, names, and default visibility.
   *
   * @property schema
   * @type {Object}
   */
  schema: null,

  /**
   * The array of columns including their ids, names,
   * and widths. This array only contains the currently
   * visible columns.
   *
   * @property columns
   * @type {Array}
   */
  columns: readOnly('resizableColumns.columns'),

  /**
   * Hook called whenever attributes are updated.
   * We use this to listen to changes to the schema.
   * If the schema changes for an existing `x-list` component
   * (happens when switching model types for example), we need
   * to rebuild the columns from scratch.
   *
   * @method didUpdateAttrs
   * @param  {Object} newAttrs and oldAttrs
   */
  didUpdateAttrs() {
    let oldSchema = this.get('oldSchema');
    let newSchema = this.get('schema');
    if (newSchema && newSchema !== oldSchema) {
      scheduleOnce('actions', this, this.setupColumns);
    }
    this.set('oldSchema', newSchema);
    return this._super(...arguments);
  },

  /**
   * The instance responsible for building the `columns`
   * array. This means that this instance controls
   * the widths of the columns as well as their visibility.
   *
   * @property resizableColumns
   * @type {ResizableColumn}
   */
  resizableColumns: null,

  /**
   * The minimum width a column can be resized to.
   * It should be high enough so that the column is still
   * visible and resizable.
   *
   * @property minWidth
   * @type {Number}
   * @default 10
   */
  minWidth: 10,

  didInsertElement() {
    scheduleOnce('afterRender', this, this.setupColumns);
    this.onResize = () => {
      this.get('debounceColumnWidths').perform();
    };
    window.addEventListener(`resize.${this.get('elementId')}`, this.onResize);
    this.get('layoutService').on('resize', this.onResize);
    return this._super(...arguments);
  },

  /**
   * Setup the context menu which allows the user
   * to toggle the visibility of each column.
   *
   * The context menu opened by right clicking on the table's
   * header.
   *
   * @method setupContextMenu
   */
  setupContextMenu() {
    let menu = this.resizableColumns.getColumnVisibility().reduce((arr, { id, name, visible }) => {
      let check = `${CHECK_HTML}`;
      if (!visible) {
        check = `<span style='opacity:0'>${check}</span>`;
      }
      name = `${check} ${name}`;
      arr.push({
        name,
        title: name,
        fn: run.bind(this, this.toggleColumnVisibility, id)
      });
      return arr;
    }, []);

    this.showBasicContext = (e) => {
      basicContext.show(menu, e);
    };

    const listHeader = this.element.querySelector('.list__header');
    if (listHeader) {
      listHeader.addEventListener('contextmenu', this.showBasicContext);
    }
  },

  /**
   * Toggle a column's visibility. This is called
   * when a user clicks on a specific column in the context
   * menu. After toggling visibility it destroys the current
   * context menu and rebuilds it with the updated column data.
   *
   * @method toggleColumnVisibility
   * @param {String} id The column's id
   */
  toggleColumnVisibility(id) {
    this.resizableColumns.toggleVisibility(id);
    const listHeader = this.element.querySelector('.list__header');
    if (listHeader) {
      listHeader.removeEventListener('contextmenu', this.showBasicContext);
    }
    this.setupContextMenu();
  },

  /**
   * Restartable `ember-concurrency` task called whenever
   * the table widths need to be recalculated due to some
   * resizing of the window or application.
   *
   * @property debounceColumnWidths
   * @type {Object} Ember Concurrency task
   */
  debounceColumnWidths: task(function* () {
    yield timeout(100);
    this.resizableColumns.setTableWidth(this.getTableWidth());
  }).restartable(),

  /**
   * Hook called when the component element will be destroyed.
   * Clean up everything.
   *
   * @method willDestroyElement
   */
  willDestroyElement() {
    window.removeEventListener(`.${this.elementId}`, this.onResize);
    const listHeader = this.element.querySelector('.list__header');
    if (listHeader) {
      listHeader.removeEventListener('contextmenu', this.showBasicContext);
    }
    this.get('layoutService').off('resize', this.onResize);
    return this._super(...arguments);
  },

  /**
   * Returns the table's width in pixels.
   *
   * @method getTableWidth
   * @return {Number} The width in pixels
   */
  getTableWidth() {
    return this.element.querySelector('.list__table-container').clientWidth;
  },

  /**
   * Creates a new `ResizableColumns` instance which
   * will calculate the columns' width and visibility.
   *
   * @method setupColumns
   */
  setupColumns() {
    let resizableColumns = new ResizableColumns({
      key: this.get('storageKey'),
      tableWidth: this.getTableWidth(),
      minWidth: this.get('minWidth'),
      storage: this.get('storage'),
      columnSchema: this.get('schema.columns') || []
    });
    resizableColumns.build();
    this.set('resizableColumns', resizableColumns);
    this.setupContextMenu();
  },

  actions: {
    /**
     * Called whenever a column is resized using the draggable handle.
     * It is responsible for updating the column info by notifying
     * `resizableColumns` about the update.
     *
     * @method didResize
     * @param {String} id The column's id
     * @param {Number} width The new width
     */
    didResize(id, width) {
      this.resizableColumns.updateColumnWidth(id, width);
    }
  }
});
