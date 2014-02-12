var accountForScrollbar = function() {
  var outside = this.$('.list-tree').innerWidth();
  var inside = this.$('.ember-list-container').innerWidth();
  this.$('.spacer').width(outside - inside);
};

var FakeTableMixin = Ember.Mixin.create({
  _accountForScrollbar: function() {
    Ember.run.scheduleOnce('afterRender', this, accountForScrollbar);
  }.on('didInsertElement')
});

export default FakeTableMixin;
