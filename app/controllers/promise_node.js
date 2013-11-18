var COLOR_MAP = {
  red: '#ff2717',
  blue: '#174fff',
  green: '#006400'
};

var PromiseNodeController = Ember.ObjectController.extend({
  needs: 'promiseTree',

  filter: Ember.computed.alias('controllers.promiseTree.filter'),
  effectiveSearch: Ember.computed.alias('controllers.promiseTree.effectiveSearch'),

  // children: Ember.computed.filter('model.children.@each.pendingBranch', function(item) {
  //   var include = true;
  //   if (this.get('filter') === 'pending') {
  //     include = item.get('pendingBranch');
  //   } else if (this.get('filter') === 'rejected') {
  //     include = item.get('rejectedBranch');
  //   } else if (this.get('filter') === 'fulfilled') {
  //     include = item.get('fulfilledBranch');
  //   }
  //   if (!include) {
  //     return false;
  //   }
  //   var search = this.get('effectiveSearch');
  //   if (!Ember.isEmpty(search)) {
  //     return item.matches(search);
  //   }
  //   return true;
  // }),

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


  nodeStyle: function() {
    var relevant;
    switch(this.get('filter')) {
      case 'pending':
        relevant = this.get('isPending');
        break;
      case 'rejected':
        relevant = this.get('isRejected');
        break;
      case 'fulfilled':
        relevant = this.get('isFulfilled');
        break;
      default:
        relevant = true;
    }
    if (relevant && !Ember.isEmpty(this.get('effectiveSearch'))) {
      relevant = this.get('model').matchesExactly(this.get('effectiveSearch'));
    }
    if (!relevant) {
      return 'opacity: 0.3';
    }
  }.property("state", "filter", "effectiveSearch"),

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

  isValueInspectable: function() {
    return !!this.get('settledValue.objectId');
  }.property('settledValue'),

  hasValue: function() {
    return this.get('settledValue.type') !== 'type-undefined';
  }.property('settledValue'),

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

  }.property('model.state'),

  actions: {
    inspectValue: function() {
      if (this.get('isValueInspectable')) {
        this.get('target').send('inspectObject', this.get('settledValue.objectId'));
      }
    }
  }
});

export default PromiseNodeController;
