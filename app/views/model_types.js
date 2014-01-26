import FakeTableMixin from "mixins/fake_table";

export default Ember.View.extend(FakeTableMixin, {
  classNames: ['split'],
  classNameBindings: ['controller.collapsed:split_state_collapsed']
});
