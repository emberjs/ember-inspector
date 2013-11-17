var COLOR_MAP = {
  red: '#ff2717',
  blue: '#174fff',
  green: '#006400'
};

var PromiseNodeController = Ember.ObjectController.extend({
  style: function() {
    var color = '';
    if (this.get('isFulfilled')) {
      color = 'green';
    } else if (this.get('isRejected')) {
      color = 'red';
    } else {
      color = 'blue';
    }
    return 'background-color:' + COLOR_MAP[color] + ';color:white;';
  }.property('model.state'),

  labelStyle: function() {
    return 'padding-left: ' + ((+this.get('level') * 20) + 5) + "px";
  }.property('level'),

  settledValue: function() {
    if (this.get('isFulfilled')) {
      return this.get('value');
    } else if (this.get('isRejected')) {
      return this.get('reason');
    } else {
      return '--';
    }

  }.property('value'),

  label: function() {
    return this.get('model.label') || '<Unknown Promise>';
  }.property('model.label'),

  state: function() {
    var state = this.get('model.state');
    if (this.get('isFulfilled')) {
      return 'Fullfilled';
    } else if (this.get('isRejected')) {
      return 'Rejected';
    } else if (this.get('parent') && !this.get('parent.isSettled')) {
      return 'Waiting for parent';
    } else {
      return 'Pending';
    }

  }.property('model.state')

});

export default PromiseNodeController;
