export default Ember.Route.extend({
  renderTemplate: function () {
    this.render();
    try {
      this.render(this.get('routeName').replace('.', '/') + '_toolbar', {
        into: 'application',
        outlet: 'toolbar'
      });
    } catch (e) {}
  }
});
