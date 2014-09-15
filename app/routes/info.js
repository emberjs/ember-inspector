import TabRoute from 'routes/tab';

var Promise = Ember.RSVP.Promise;
var oneWay = Ember.computed.oneWay;

export default TabRoute.extend({
  version: oneWay('config.VERSION').readOnly(),

  model: function() {
    var version = this.get('version');
    var port = this.get('port');
    return new Promise(function(resolve) {
      port.one('general:libraries', function(message) {
        message.libraries.insertAt(0, {
          name: 'Ember Inspector',
          version: version
        });
        resolve(message.libraries);
      });
      port.send('general:getLibraries');
    });
  }
});
