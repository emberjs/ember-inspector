import Ember from "ember";
import TabRoute from "ember-inspector/routes/tab";
const set = Ember.set;

export default TabRoute.extend({
  setupController: function() {
    let port = this.get('port');
    port.on('deprecation:deprecationsAdded', this, this.deprecationsAdded);
    port.send('deprecation:watch');
    this._super.apply(this, arguments);
  },

  model() {
    return [];
  },

  deactivate() {
    this.get('port').off('deprecation:deprecationsAdded', this, this.deprecationsAdded);
  },

  deprecationsAdded(message) {
    const model = this.get('currentModel');
    message.deprecations.forEach(item => {
      let record = model.findBy('id', item.id);
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
    openResource(item) {
      this.get('adapter').openResource(item.fullSource, item.line);
    },

    traceDeprecations(deprecation) {
      this.get('port').send('deprecation:sendStackTraces', {
        deprecation: deprecation
      });
    },

    traceSource(deprecation, source) {
      this.get('port').send('deprecation:sendStackTraces', {
        deprecation: {
          message: deprecation.message,
          sources: [source]
        }
      });
    },

    clear() {
      this.get('port').send('deprecation:clear');
      this.get('currentModel').clear();
    }

  }
});
