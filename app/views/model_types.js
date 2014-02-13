import FakeTableMixin from "mixins/fake_table";

var ModelTypesView = Ember.View.extend(FakeTableMixin, {
  classNames: ['split'],
  classNameBindings: ['controller.collapsed:split_state_collapsed']
});

export default ModelTypesView;
