/**
 * Returns a medium sized model name. Makes sure it's maximum 50 characters long.
 *
 * @method modelName
 * @param  {Any} model
 * @return {String}       The model name.
 */
export function modelName(model) {
  let name = '<Unknown model>';
  if (model.toString) {
    name = model.toString();
  }

  if (name.length > 50) {
    name = `${name.slice(0, 50)}...`;
  }
  return name;
}

/**
 * Takes an Ember Data model and strips out the extra noise from the name.
 *
 * @method shortModelName
 * @param  {DS.Model} model
 * @return {String}       The concise model name.
 */
export function shortModelName(model) {
  let name = modelName(model);
  // jj-abrams-resolver adds `app@model:`
  return name.replace(/<[^>]+@model:/g, '<');
}

/**
 * Returns the controller name. Strips out extra noise such as `subclass of`.
 *
 * @method controllerName
 * @param  {Controller} controller
 * @return {String}            The controller name
 */
export function controllerName(controller) {
  return controller.toString();
}

/**
 * Cleans up the controller name before returning it.
 *
 * @method shortControllerName
 * @param  {Controller} controller
 * @return {String}            The short controller name
 */
export function shortControllerName(controller) {
  let name = cleanupInstanceName(controllerName(controller));
  let match = name.match(/^\(generated (.+) controller\)/);
  if (match) {
    return match[1];
  }
  return name;
}

/**
 * Cleans up an instance name to create shorter/less noisy names.
 * Example: `<app@component:textarea::ember545>` becomes `textarea`.
 *
 * @method cleanupInstanceName
 * @param  {String} name
 * @return {String} The short/cleaner name
 */
function cleanupInstanceName(name) {
  let match = name.match(/^.+:(.+)::/);
  if (!match) {
    // Support for Namespace names (instead of module) (for the tests).
    // `<App.ApplicationController:ember301>` => `App.ApplicationController`
    match = name.match(/^<(.+):/);
  }
  if (match) {
    return match[1];
  }
  return name;
}

/**
 * Cleans up the view name before returning it.
 *
 * @method shortViewName
 * @param  {Component} view The component.
 * @return {String}      The short view name.
 */
export function shortViewName(view) {
  return cleanupInstanceName(viewName(view));
}

/**
 * Returns the view name. Removes the `subclass` noise.
 *
 * @method viewName
 * @param  {Component} view The component.
 * @return {String}      The view name.
 */
export function viewName(view) {
  return view.toString();
}
