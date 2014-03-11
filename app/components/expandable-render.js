export default Em.Component.extend({
  expanded: false,

  actions: {
    expand: function() {
      this.toggleProperty('expanded');
    }
  }
});

