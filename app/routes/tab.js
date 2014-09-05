export default Ember.Route.extend({
  renderTemplate: function () {
    this.render();
    try {
      this.render(this.get('routeName') + '_toolbar', {
        into: 'application',
        outlet: 'toolbar'
      });
    } catch (e) {}
  }
});