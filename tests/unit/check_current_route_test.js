import checkCurrentRoute from 'ember-inspector/utils/check-current-route';

module("checkCurrentRoute");

test("matches the correct routes", function() {
  ok(checkCurrentRoute('whatever', 'application'), 'application is always current');
  ok(checkCurrentRoute('index', 'index'), 'index route matches correctly');
  ok(!checkCurrentRoute('posts.index', 'index'), 'resource match fails even when route name same as resource name');

  ok(checkCurrentRoute('posts.show', 'posts'), 'resource matches correctly');
  ok(!checkCurrentRoute('posts.show', 'comments'), 'resource matches correctly');
  ok(checkCurrentRoute('posts.comments.show', 'posts'), 'parent resource of nested resources matches correctly');
  ok(checkCurrentRoute('comments.show', 'comments.show'), 'exact resource and route matches correctly');
  ok(checkCurrentRoute('posts.comments.show', 'comments.show'), 'child resource and route matches correctly');
});
