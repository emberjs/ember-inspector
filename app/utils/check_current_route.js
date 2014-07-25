export default function(currentRouteName, routeName) {
  var regName, val;

  if (routeName === 'application') {
    return true;
  }

  regName = routeName.replace('.', '\\.');
  val = !!currentRouteName.match(new RegExp('(^|\\.)' + regName + '(\\.|$)'));

  return val;
};
