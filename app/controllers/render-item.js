import Ember from "ember";
import escapeRegExp from "ember-inspector/utils/escape-reg-exp";
const { ObjectController, computed, isEmpty, run, on, observer} = Ember;
const { gt, oneWay } = computed;
const { once } = run;

export default ObjectController.extend({
  needs: ['render-tree'],

  search: oneWay('controllers.render-tree.search').readOnly(),

  isExpanded: false,

  expand() {
    this.set('isExpanded', true);
  },

  searchChanged: on('init', observer('search', function() {
    let search = this.get('search');
    if (!isEmpty(search)) {
      once(this, 'expand');
    }
  })),

  searchMatch: computed('search', 'name', function() {
    let search = this.get('search');
    if (isEmpty(search)) {
      return true;
    }
    let name = this.get('name');
    let regExp = new RegExp(escapeRegExp(search.toLowerCase()));
    return !!name.toLowerCase().match(regExp);
  }),

  nodeStyle: computed('searchMatch', function() {
    if (!this.get('searchMatch')) {
      return 'opacity: 0.5';
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
    return 'padding-left: ' + ((+this.get('level') * 20) + 5) + "px";
  }),

  hasChildren: gt('children.length', 0),

  expandedClass: computed('hasChildren', 'isExpanded', function() {
    if (!this.get('hasChildren')) { return; }

    if (this.get('isExpanded')) {
      return 'row_arrow_expanded';
    } else {
      return 'row_arrow_collapsed';
    }
  }),

  readableTime: computed('timestamp', function() {
    let d = new Date(this.get('timestamp')),
        ms = d.getMilliseconds(),
        seconds = d.getSeconds(),
        minutes = d.getMinutes().toString().length === 1 ? '0' + d.getMinutes() : d.getMinutes(),
        hours = d.getHours().toString().length === 1 ? '0' + d.getHours() : d.getHours();

    return hours + ':' + minutes + ':' + seconds + ':' + ms;
  }),

  actions: {
    toggleExpand() {
      this.toggleProperty('isExpanded');
    }
  }

});
