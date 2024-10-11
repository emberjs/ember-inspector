import checkCurrentRoute from 'ember-inspector/utils/check-current-route';
import { module, test } from 'qunit';

module('Unit | Helper | checkCurrentRoute', function () {
  test('matches the correct routes', function (assert) {
    const testSet = [
      {
        currentRoute: {
          url: '/users',
          name: 'users',
        },
        routeValue: {
          url: '',
          name: 'application',
        },
        message: 'application is always current',
      },
      {
        currentRoute: {
          url: '/',
          name: 'index',
        },
        routeValue: {
          url: '/',
          name: 'index',
        },
        message: 'index route matches correctly',
      },
      {
        currentRoute: {
          url: '/posts',
          name: 'posts.index',
        },
        routeValue: {
          url: '/posts',
          name: 'posts.index',
        },
        message: 'resource matches correctly',
      },
      {
        currentRoute: {
          url: '/posts/comments/show',
          name: 'posts.comments.show',
        },
        routeValue: {
          url: '/posts/comments/show',
          name: 'posts',
        },
        message: 'parent resource of nested resources matches correctly',
      },
      {
        currentRoute: {
          url: '/comments/show',
          name: 'comments.show',
        },
        routeValue: {
          url: '/comments/show',
          name: 'comments.show',
        },
        message: 'exact resource and route matches correctly',
      },
      {
        currentRoute: {
          url: '/posts/comments/show',
          name: 'posts.comments.show',
        },
        routeValue: {
          url: '/posts/comments/show',
          name: 'comments.show',
        },
        message: 'child resource and route matches correctly',
      },
      {
        currentRoute: {
          url: '/comments',
          name: 'comments',
        },
        routeValue: {
          url: '/comments',
          name: 'comments',
        },
        message: 'route w/ resetNamespace matches correctly',
      },
      {
        currentRoute: {
          url: '/company/department/employees',
          name: 'company.department.employees',
        },
        routeValue: {
          url: '/company/department/employees',
          name: 'employees',
        },
        message: 'nested route w/ resetNamespace matches correctly',
      },
    ];

    testSet.forEach(({ currentRoute, routeValue, message }) => {
      assert.ok(checkCurrentRoute(currentRoute, routeValue), message);
    });
  });

  test('does not match incorrect routes', function (assert) {
    const testSet = [
      {
        currentRoute: {
          url: '/posts/show',
          name: 'posts.show',
        },
        routeValue: {
          url: '/posts',
          name: 'index',
        },
        message:
          'resource match fails even when route name same as resource name',
      },
      {
        currentRoute: {
          url: '/posts/show',
          name: 'posts.show',
        },
        routeValue: {
          url: '/comments/show',
          name: 'comments',
        },
        message: 'resource match fails when current route does not match url',
      },
      {
        currentRoute: {
          url: '/posts/show/comments',
          name: 'posts.show.comments',
        },
        routeValue: {
          url: '/users/comments',
          name: 'comments',
        },
        message:
          'resource match fails when current route does not match full url path',
      },
      {
        currentRoute: {
          url: '/posts/show/comments',
          name: 'posts.show.comments',
        },
        routeValue: {
          url: '/comments',
          name: 'comments',
        },
        message:
          'resource match fails when current route does not match the root route',
      },
    ];

    testSet.forEach(({ currentRoute, routeValue, message }) => {
      assert.notOk(checkCurrentRoute(currentRoute, routeValue), message);
    });
  });
});
