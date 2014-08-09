module.exports = {
  options: {
    bucket: 'ember-extension',
    access: 'public-read',
    headers: {
      // One day cache policy (1000 * 60 * 60 * 24)
      "Cache-Control": "max-age=86400000, public"
    }
  },
  bookmarklet: {
    sync: [{
      src: 'dist_bookmarklet/**/*.*',
      dest: 'dist_bookmarklet/',
      rel: 'dist_bookmarklet',
      options: { verify: true }
    }]
  }
};
