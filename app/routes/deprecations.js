import Ember from "ember";
import TabRoute from "ember-inspector/routes/tab";
var set = Ember.set;

export default TabRoute.extend({
    setupController: function() {
      var port = this.get('port');
      port.on('deprecation:deprecationsAdded', this, this.deprecationsAdded);
      port.send('deprecation:watch');
      this._super.apply(this, arguments);
    },

    model: function() {
      return [];
    },

    deactivate: function() {
      this.get('port').off('deprecation:deprecationsAdded', this, this.deprecationsAdded);
    },

    deprecationsAdded: function(message) {
      var model = this.get('currentModel');
      message.deprecations.forEach(function(item) {
        var record = model.findBy('id', item.id);
        if (record) {
          set(record, 'count', item.count);
          set(record, 'sources', item.sources);
          set(record, 'url', item.url);
        } else {
          model.pushObject(item);
        }
      });
    },

    actions: {
      openResource: function(item) {
        this.get('adapter').openResource(item.fullSource, item.line);
      },

      traceDeprecations: function(deprecation) {
        this.get('port').send('deprecation:sendStackTraces', {
          deprecation: deprecation
        });
      },

      traceSource: function(deprecation, source) {
        this.get('port').send('deprecation:sendStackTraces', {
          deprecation: {
            message: deprecation.message,
            sources: [source]
          }
        });
      },

      clear: function() {
        this.get('port').send('deprecation:clear');
        this.get('currentModel').clear();
      }

    }
});
