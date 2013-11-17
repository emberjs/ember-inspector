var COLOR_MAP = {
  red: '#ff2717',
  blue: '#174fff',
  green: '#006400'
};

var PromiseNodeController = Ember.ObjectController.extend({
  needs: 'promiseTree',

  filter: Ember.computed.alias('controllers.promiseTree.filter'),

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

  // children: Ember.computed.filter('model.children', function(item) {
  //   switch (this.get('filter')) {
  //     case 'all':
  //       return true;
  //     case 'pending':
  //       return !item.get('isSettled');
  //     case 'fullfilled':
  //       return !item.get('isFulfilled');
  //     case 'rejected':
  //       return !item.get('isRejected');
  //   }
  // }),

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
