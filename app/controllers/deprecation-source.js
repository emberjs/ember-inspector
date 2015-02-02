import Ember from "ember";
var Controller = Ember.Controller;
var computed = Ember.computed;
var bool = computed.bool;
var readOnly = computed.readOnly;
var and = computed.and;

export default Controller.extend({
  known: bool('model.map.source'),

  url: function() {
    var source = this.get('model.map.source');
    if (this.get('known')) {
      return source + ':' + this.get('model.map.line');
    } else {
      return 'Unkown source';
    }
  }.property('model.map.source', 'model.map.line', 'known'),

  adapter: readOnly('port.adapter'),

  isClickable: and('known', 'adapter.canOpenResource')
});
