var COLOR_MAP = {
  red: '#ff2717',
  blue: '#174fff',
  green: '#006400'
};

var alias = Ember.computed.alias;
var notEmpty = Ember.computed.notEmpty;

export default  Ember.ObjectProxy.extend({
  promiseTreeController: function() {
    return this.container.lookup('controller:promiseTree');
  }.property(),

  filter: alias('promiseTreeController.filter'),
  effectiveSearch: alias('promiseTreeController.effectiveSearch'),

  model: alias('content'),

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
  }.property('state', 'filter', 'effectiveSearch'),

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

  isValueInspectable: notEmpty('settledValue.objectId'),

  hasValue: function() {
    return this.get('isSettled') && this.get('settledValue.type') !== 'type-undefined';
  }.property('settledValue', 'isSettled'),

  label: function() {
    return this.get('model.label') || (!!this.get('model.parent') && 'Then') || '<Unknown Promise>';
  }.property('model.label'),

  state: function() {
    var state = this.get('model.state');
    if (this.get('isFulfilled')) {
      return 'Fulfilled';
    } else if (this.get('isRejected')) {
      return 'Rejected';
    } else if (this.get('parent') && !this.get('parent.isSettled')) {
      return 'Waiting for parent';
    } else {
      return 'Pending';
    }

  }.property('model.state'),

  timeToSettle: function() {
    if (!this.get('createdAt') || !this.get('settledAt')) {
      return ' -- ';
    }
    var startedAt = this.get('parent.settledAt') || this.get('createdAt');
    var remaining = this.get('settledAt').getTime() - startedAt.getTime();
    var min = Math.floor(remaining / (1000 * 60));
    remaining -= min * 1000 * 60;
    var sec = Math.floor(remaining / 1000);
    remaining -= sec * 1000;
    var ms = remaining;
    var val = '';
    if (min > 0) {
      val += min + 'min ';
    }
    if (sec > 0) {
      val += sec + 's ';
    }
    if (ms > 0 || Ember.isEmpty(val)) {
      val += ms + 'ms';
    }
    return val;
  }.property('createdAt', 'settledAt', 'parent.settledAt')
});
