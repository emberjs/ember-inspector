import PortMixin from "ember-debug/mixins/port-mixin";
import SourceMap from "ember-debug/libs/source-map";
const Ember = window.Ember;
const { Debug, Object: EmberObject, computed, guidFor, run, RSVP, A } = Ember;
const { resolve, all } = RSVP;
const { readOnly } = computed;
const { registerDeprecationHandler } = Debug;

export default EmberObject.extend(PortMixin, {
  portNamespace: 'deprecation',

  port: readOnly('namespace.port'),

  adapter: readOnly('port.adapter'),

  deprecations: computed(function() {
    return A();
  }),

  groupedDeprecations: computed(function() {
    return {};
  }),

  deprecationsToSend: computed(function() {
    return A();
  }),

  sourceMap: computed(function() {
    return SourceMap.create();
  }),

  emberCliConfig: readOnly('namespace.generalDebug.emberCliConfig'),

  init() {
    this._super();
    this.handleDeprecations();
  },

  /**
   * Checks if ember-cli and looks for source maps.
   */
  fetchSourceMap(stackStr) {
    if (this.get('emberCliConfig') && this.get('emberCliConfig.environment') === 'development') {
      return this.get('sourceMap').map(stackStr).then(mapped => {
        if (mapped && mapped.length > 0) {
          let source = mapped.find(
            item => item.source && !!item.source.match(new RegExp(this.get('emberCliConfig.modulePrefix'))));

          if (source) {
            source.found = true;
          } else {
            source = mapped.get('firstObject');
            source.found = false;
          }
          return source;
        }
      }, null, 'ember-inspector');
    } else {
      return resolve(null, 'ember-inspector');
    }

  },

  sendPending() {
    if (this.isDestroyed) {
      return;
    }

    let deprecations = A();

    let promises = all(this.get('deprecationsToSend').map(deprecation => {
      let obj;
      let promise = resolve(undefined, 'ember-inspector');
      let grouped = this.get('groupedDeprecations');
      this.get('deprecations').pushObject(deprecation);
      const id = guidFor(deprecation.message);
      obj = grouped[id];
      if (obj) {
        obj.count++;
        obj.url = obj.url || deprecation.url;
      } else {
        obj = deprecation;
        obj.count = 1;
        obj.id = id;
        obj.sources = A();
        grouped[id] = obj;
      }
      let found = obj.sources.findBy('stackStr', deprecation.stackStr);
      if (!found) {
        let stackStr = deprecation.stackStr;
        promise = this.fetchSourceMap(stackStr).then(map => {
          obj.sources.pushObject({ map, stackStr });
          if (map) {
            obj.hasSourceMap = true;
          }
        }, null, 'ember-inspector');
      }
      return promise.then(() => {
        delete obj.stackStr;
        deprecations.addObject(obj);
      }, null, 'ember-inspector');
    }));

    promises.then(() => {
      this.sendMessage('deprecationsAdded', { deprecations });
      this.get('deprecationsToSend').clear();
      this.sendCount();
    }, null, 'ember-inspector');
  },

  sendCount() {
    if (this.isDestroyed) {
      return;
    }

    this.sendMessage('count', {
      count: this.get('deprecations.length') + this.get('deprecationsToSend.length')
    });
  },

  messages: {
    watch() {
      this._watching = true;
      let grouped = this.get('groupedDeprecations');
      let deprecations = [];
      for (let i in grouped) {
        if (!grouped.hasOwnProperty(i)) {
          continue;
        }
        deprecations.push(grouped[i]);
      }
      this.sendMessage('deprecationsAdded', {
        deprecations
      });
      this.sendPending();
    },

    sendStackTraces(message) {
      let deprecation = message.deprecation;
      deprecation.sources.forEach(source => {
        let stack = source.stackStr;
        stack = stack.split('\n');
        stack.unshift(`Ember Inspector (Deprecation Trace): ${deprecation.message || ''}`);
        this.get('adapter').log(stack.join('\n'));
      });
    },

    getCount() {
      this.sendCount();
    },

    clear() {
      run.cancel(this.debounce);
      this.get('deprecations').clear();
      this.set('groupedDeprecations', {});
      this.sendCount();
    },

    release() {
      this._watching = false;
    }
  },

  willDestroy() {
    run.cancel(this.debounce);
    return this._super(...arguments);
  },

  handleDeprecations() {
    registerDeprecationHandler((message, options) => {
      /* global __fail__*/

      let error;

      // When using new Error, we can't do the arguments check for Chrome. Alternatives are welcome
      try { __fail__.fail(); } catch (e) { error = e; }

      let stack;
      let stackStr = '';
      if (error.stack) {

        // var stack;
        if (error['arguments']) {
          // Chrome
          stack = error.stack.replace(/^\s+at\s+/gm, '').
            replace(/^([^\(]+?)([\n$])/gm, '{anonymous}($1)$2').
            replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}($1)').split('\n');
          stack.shift();
        } else {
          // Firefox
          stack = error.stack.replace(/(?:\n@:0)?\s+$/m, '').
            replace(/^\(/gm, '{anonymous}(').split('\n');
        }

        stackStr = `\n    ${stack.slice(2).join("\n    ")}`;
      }

      let url;
      if (options && typeof options === 'object') {
        url = options.url;
      }

      const deprecation = { message, stackStr, url };

      // For ember-debug testing we usually don't want
      // to catch deprecations
      if (!this.get('namespace').IGNORE_DEPRECATIONS) {
        this.get('deprecationsToSend').pushObject(deprecation);
        run.cancel(this.debounce);
        if (this._watching) {
          this.debounce = run.debounce(this, 'sendPending', 100);
        } else {
          this.debounce = run.debounce(this, 'sendCount', 100);
        }
        if (!this._warned) {
          this.get("adapter").warn("Deprecations were detected, see the Ember Inspector deprecations tab for more details.");
          this._warned = true;
        }
      }
    });
  }

});
