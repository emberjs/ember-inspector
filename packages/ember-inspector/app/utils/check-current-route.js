export default function (currentRoute, routeValue) {
  const { name: currentRouteName, url: currentRouteURL } = currentRoute;
  const { url: routeURL, name: routeName } = routeValue;

  if (routeName === 'application') {
    return true;
  }

  const regName = routeName && routeName.replace(/\./g, '\\.');
  let match =
    currentRouteName &&
    currentRouteName.match(new RegExp(`(^|\\.)${regName}(\\.|$)`));

  const invalidMatch = match && match[0].match(/^\.[^.]+$/);
  const isResetNamespacedRoute =
    invalidMatch && invalidMatch[0] === `.${routeName}`;
  const hasMatchingURL = routeURL === currentRouteURL;

  if (routeName !== 'index' && isResetNamespacedRoute && hasMatchingURL) {
    return true;
  } else if (invalidMatch) {
    return false;
  }

  return !!match;
}
