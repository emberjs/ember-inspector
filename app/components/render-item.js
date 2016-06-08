import Ember from "ember";
import escapeRegExp from "ember-inspector/utils/escape-reg-exp";
const { computed, isEmpty, run, on, observer, Handlebars: { SafeString } } = Ember;
const { gt } = computed;
const { once } = run;

const component = Ember.Component.extend({
  item: null,
  search: null,

  isExpanded: false,

  expand(bool) {
    this.set('isExpanded', bool);
  },

  searchChanged: on('init', observer('search', function() {
    let search = this.get('search');
    if (!isEmpty(search)) {
      once(this, 'expand', true);
    } else {
      once(this, 'expand', false);
    }
  })),

  searchMatch: computed('search', 'item.name', function() {
    let search = this.get('search');
    if (isEmpty(search)) {
      return true;
    }
    let name = this.get('item.name');
    let regExp = new RegExp(escapeRegExp(search.toLowerCase()));
    return !!name.toLowerCase().match(regExp);
  }),

  nodeStyle: computed('searchMatch', function() {
    if (!this.get('searchMatch')) {
      return new SafeString('opacity: 0.5;');
    }
  }),

  level: computed('target.level', function() {
    let parentLevel = this.get('target.level');
    if (parentLevel === undefined) {
      parentLevel = -1;
    }
    return parentLevel + 1;
  }),

  nameStyle: computed('level', function() {
    return new SafeString(`padding-left: ${+this.get('level') * 20 + 5}px;`);
  }),

  hasChildren: gt('item.children.length', 0),

  expandedClass: computed('hasChildren', 'isExpanded', function() {
    if (!this.get('hasChildren')) { return; }

    if (this.get('isExpanded')) {
      return 'row_arrow_expanded';
    } else {
      return 'row_arrow_collapsed';
    }
  }),

  readableTime: computed('item.timestamp', function() {
    let d = new Date(this.get('item.timestamp'));
    let ms = d.getMilliseconds();
    let seconds = d.getSeconds();
    let minutes = d.getMinutes().toString().length === 1 ? '0' + d.getMinutes() : d.getMinutes();
    let hours = d.getHours().toString().length === 1 ? '0' + d.getHours() : d.getHours();

    return hours + ':' + minutes + ':' + seconds + ':' + ms;
  }),

  actions: {
    toggleExpand() {
      this.toggleProperty('isExpanded');
    }
  }
});

component.reopenClass({
  positionalParams: ['item', 'search']
});

export default component;
