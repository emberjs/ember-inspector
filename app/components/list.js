import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { localCopy } from 'tracked-toolbox';
import { bind, scheduleOnce } from '@ember/runloop';
import { restartableTask, timeout } from 'ember-concurrency';
import ResizableColumns from 'ember-inspector/libs/resizable-columns';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

const CHECK_HTML = '&#10003;';

export default class ListComponent extends Component {
  /**
   * Layout service used to listen to changes to the application
   * layout such as resizing of the main nav or object inspector.
   */
  @service('layout') layoutService;

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
  @service storage;

  /**
   * Class to pass to each row in `vertical-collection`.
   *
   * @property itemClass
   * @type {String}
   * @default ''
   */
  itemClass = '';

  /**
   * The minimum width a column can be resized to.
   * It should be high enough so that the column is still
   * visible and resizable.
   *
   * @property minWidth
   * @type {Number}
   * @default 10
   */
  minWidth = 10;

  @tracked oldSchema;

  /**
   * The instance responsible for building the `columns`
   * array. This means that this instance controls
   * the widths of the columns as well as their visibility.
   *
   * @property resizableColumns
   * @type {ResizableColumn}
   */
  @tracked resizableColumns = null;

  /**
   * Indicate the table's header's height in pixels.
   * Set this to `0` when there's no header.
   *
   * @property headerHeight
   * @type {Number}
   * @default 31
   */
  @localCopy('args.headerHeight', 31) headerHeight;

  /**
   * The schema that contains the list's columns,
   * their ids, names, and default visibility.
   *
   * @property schema
   * @type {Object}
   */
  @localCopy('args.schema', null) schema;

  /**
   * The array of columns including their ids, names,
   * and widths. This array only contains the currently
   * visible columns.
   *
   * @property columns
   * @type {Array}
   */
  get columns() {
    return this.resizableColumns?.columns;
  }

  /**
   * The key used to cache the current schema. Defaults
   * to the list's name.
   *
   * @property storageKey
   * @type {String}
   */
  get storageKey() {
    return this.name;
  }

  /**
   * Hook called whenever attributes are updated.
   * We use this to listen to changes to the schema.
   * If the schema changes for an existing `list` component
   * (happens when switching model types for example), we need
   * to rebuild the columns from scratch.
   *
   * @method schemaUpdated
   * @param  {Object} newAttrs and oldAttrs
   */
  @action
  schemaUpdated() {
    let oldSchema = this.oldSchema;
    let newSchema = this.schema;
    if (newSchema && newSchema !== oldSchema) {
      // eslint-disable-next-line ember/no-runloop
      scheduleOnce('actions', this, this.setupColumns);
    }
    this.oldSchema = newSchema;
  }

  @action
  elementInserted(el) {
    this.el = el;
    // eslint-disable-next-line ember/no-runloop
    scheduleOnce('afterRender', this, this.setupColumns);
    this.onResize = () => {
      this.debounceColumnWidths.perform();
    };
    this.layoutService.on('content-height-update', this.onResize);
  }

  /**
   * Setup the context menu which allows the user
   * to toggle the visibility of each column.
   *
   * The context menu opened by right clicking on the table's
   * header.
   *
   * @method setupContextMenu
   */
  @action
  setupContextMenu() {
    let menu = this.resizableColumns
      .getColumnVisibility()
      .reduce((arr, { id, name, visible }) => {
        let check = `${CHECK_HTML}`;
        if (!visible) {
          check = `<span style='opacity:0'>${check}</span>`;
        }
        name = `${check} ${name}`;
        arr.push({
          name,
          title: name,
          // eslint-disable-next-line ember/no-runloop
          fn: bind(this, this.toggleColumnVisibility, id),
        });
        return arr;
      }, []);

    this.showBasicContext = (e) => {
      basicContext.show(menu, e);
    };

    const listHeader = this.el.querySelector('.list-header');
    if (listHeader) {
      listHeader.addEventListener('contextmenu', this.showBasicContext);
    }
  }

  /**
   * Toggle a column's visibility. This is called
   * when a user clicks on a specific column in the context
   * menu. After toggling visibility it destroys the current
   * context menu and rebuilds it with the updated column data.
   *
   * @method toggleColumnVisibility
   * @param {String} id The column's id
   */
  @action
  toggleColumnVisibility(id) {
    this.resizableColumns.toggleVisibility(id);
    const listHeader = this.el.querySelector('.list-header');
    if (listHeader) {
      listHeader.removeEventListener('contextmenu', this.showBasicContext);
    }
    this.setupContextMenu();
  }

  /**
   * Restartable `ember-concurrency` task called whenever
   * the table widths need to be recalculated due to some
   * resizing of the window or application.
   *
   * @property debounceColumnWidths
   * @type {Object} Ember Concurrency task
   */
  @restartableTask
  *debounceColumnWidths() {
    yield timeout(100);
    this.resizableColumns.setTableWidth(this.getTableWidth());
  }

  /**
   * Hook called when the component element will be destroyed.
   * Clean up everything.
   *
   * @method willDestroy
   */
  willDestroy() {
    const listHeader = this.el.querySelector('.list-header');
    if (listHeader) {
      listHeader.removeEventListener('contextmenu', this.showBasicContext);
    }
    this.layoutService.off('content-height-update', this.onResize);
    return super.willDestroy(...arguments);
  }

  /**
   * Returns the table's width in pixels.
   *
   * @method getTableWidth
   * @return {Number} The width in pixels
   */
  @action
  getTableWidth() {
    return this.el.querySelector('.list-table-container').clientWidth;
  }

  /**
   * Creates a new `ResizableColumns` instance which
   * will calculate the columns' width and visibility.
   *
   * @method setupColumns
   */
  @action
  setupColumns() {
    let resizableColumns = new ResizableColumns({
      key: this.storageKey,
      tableWidth: this.getTableWidth(),
      minWidth: this.minWidth,
      storage: this.storage,
      columnSchema: this.schema?.columns || [],
    });
    resizableColumns.build();
    this.resizableColumns = resizableColumns;
    this.setupContextMenu();
  }

  /**
   * Called whenever a column is resized using the draggable handle.
   * It is responsible for updating the column info by notifying
   * `resizableColumns` about the update.
   *
   * @method didResize
   * @param {String} id The column's id
   * @param {Number} width The new width
   */
  @action
  didResize(id, width) {
    this.resizableColumns.updateColumnWidth(id, width);
  }
}
