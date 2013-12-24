var accountForScrollbar = function() {
  var outside = this.$('.list-tree').innerWidth();
  var inside = this.$('.ember-list-container').innerWidth();
  this.$('.spacer').width(outside - inside);
};

var PromiseTreeView = Ember.View.extend({
  didInsertElement: function() {
    Ember.run.scheduleOnce('afterRender', this, accountForScrollbar);
  }
});


export default PromiseTreeView;
