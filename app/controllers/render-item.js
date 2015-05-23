import Ember from "ember";
import escapeRegExp from "ember-inspector/utils/escape-reg-exp";
const { ObjectController, computed, isEmpty, run} = Ember;
const { gt, oneWay } = computed;
const { once } = run;

export default ObjectController.extend({
  needs: ['render-tree'],

  search: oneWay('controllers.render-tree.search').readOnly(),

  isExpanded: false,

  expand: function() {
    this.set('isExpanded', true);
  },

  searchChanged: function() {
    let search = this.get('search');
    if (!isEmpty(search)) {
      once(this, 'expand');
    }
  }.observes('search').on('init'),

  searchMatch: function() {
    let search = this.get('search');
    if (isEmpty(search)) {
      return true;
    }
    let name = this.get('name');
    let regExp = new RegExp(escapeRegExp(search.toLowerCase()));
    return !!name.toLowerCase().match(regExp);
  }.property('search', 'name'),

  nodeStyle: function() {
    if (!this.get('searchMatch')) {
      return 'opacity: 0.5';
    }
  }.property('searchMatch'),

  level: function() {
    let parentLevel = this.get('target.level');
    if (parentLevel === undefined) {
      parentLevel = -1;
    }
    return parentLevel + 1;
  }.property('target.level'),

  nameStyle: function() {
    return 'padding-left: ' + ((+this.get('level') * 20) + 5) + "px";
  }.property('level'),

  hasChildren: gt('children.length', 0),

  expandedClass: function() {
    if (!this.get('hasChildren')) { return; }

    if (this.get('isExpanded')) {
      return 'row_arrow_expanded';
    } else {
      return 'row_arrow_collapsed';
    }
  }.property('hasChildren', 'isExpanded'),

  readableTime: function() {
    let d = new Date(this.get('timestamp')),
        ms = d.getMilliseconds(),
        seconds = d.getSeconds(),
        minutes = d.getMinutes().toString().length === 1 ? '0' + d.getMinutes() : d.getMinutes(),
        hours = d.getHours().toString().length === 1 ? '0' + d.getHours() : d.getHours();

    return hours + ':' + minutes + ':' + seconds + ':' + ms;
  }.property('timestamp'),

  actions: {
    toggleExpand: function() {
      this.toggleProperty('isExpanded');
    }
  }

});
