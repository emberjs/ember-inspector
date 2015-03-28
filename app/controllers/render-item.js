import Ember from "ember";
import escapeRegExp from "ember-inspector/utils/escape-reg-exp";
var ObjectController = Ember.ObjectController;
var gt = Ember.computed.gt;
var oneWay = Ember.computed.oneWay;
var isEmpty = Ember.isEmpty;
var runOnce = Ember.run.once;

export default ObjectController.extend({
  needs: ['render-tree'],

  search: oneWay('controllers.render-tree.search').readOnly(),

  isExpanded: false,

  expand: function() {
    this.set('isExpanded', true);
  },

  searchChanged: function() {
    var search = this.get('search');
    if (!isEmpty(search)) {
      runOnce(this, 'expand');
    }
  }.observes('search').on('init'),

  searchMatch: function() {
    var search = this.get('search');
    if (isEmpty(search)) {
      return true;
    }
    var name = this.get('name');
    var regExp = new RegExp(escapeRegExp(search.toLowerCase()));
    return !!name.toLowerCase().match(regExp);
  }.property('search', 'name'),

  nodeStyle: function() {
    if (!this.get('searchMatch')) {
      return 'opacity: 0.5';
    }
  }.property('searchMatch'),

  level: function() {
    var parentLevel = this.get('target.level');
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
    var d = new Date(this.get('timestamp')),
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
