module.exports = {
  server: {
    options: {
      port: 9292,
      hostname: '127.0.0.1',
      base: 'tmp/public',
      middleware: middleware
    }
  }
};

function blockDuringBuild(req,res,next){
  if (process.isLockedDuringBuild) {
    var tryAgainSoon = function() {
      setTimeout(function(){
        if (process.isLockedDuringBuild) {
          tryAgainSoon();
        } else {
          next();
        }
      }, 100);
    };
    tryAgainSoon();
  } else {
    next();
  }
}

function middleware(connect, options) {
  return [
    blockDuringBuild,
    connect['static'](options.base),
    connect.directory(options.base)
  ];
}
