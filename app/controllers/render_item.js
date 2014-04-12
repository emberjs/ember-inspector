var ObjectController = Ember.ObjectController;
var gt = Ember.computed.gt;

export default  ObjectController.extend({
  isExpanded: false,

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
