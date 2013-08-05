var PropertyFieldView = Ember.TextField.extend({
  attributeBindings: ['label:data-label'],

  didInsertElement: function() {
    this._super();
    this.$().select();
  },


  insertNewline: function() {
    this.get('controller').send('saveProperty');
    this.set('controller.isEdit', false);
  },

  cancel: function() {
    this.set('controller.isEdit', false);
  },

  focusOut: function() {
    this.set('controller.isEdit', false);
  }

});

export default PropertyFieldView;
