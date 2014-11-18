module.exports = {
  name: "websocket-dist",

  contentFor: function(type) {
    if (type === 'head' && process.env.EMBER_DIST === 'websocket') {
      return '{{ remote-port }}';
    }
  }
};
