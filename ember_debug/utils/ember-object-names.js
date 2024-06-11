import { classes, Views } from 'ember-debug/utils/ember';

/**
 * Add Known Ember Mixins and Classes so we can label them correctly in the inspector
 */
const emberNames = new Map([
  [classes.Evented, 'Evented Mixin'],
  [classes.PromiseProxyMixin, 'PromiseProxy Mixin'],
  [classes.MutableArray, 'MutableArray Mixin'],
  [classes.MutableEnumerable, 'MutableEnumerable Mixin'],
  [classes.NativeArray, 'NativeArray Mixin'],
  [classes.Observable, 'Observable Mixin'],
  [classes.ControllerMixin, 'Controller Mixin'],
  [classes.ActionHandler, 'ActionHandler Mixin'],
  [classes.CoreObject, 'CoreObject'],
  [classes.EmberObject, 'EmberObject'],
  [classes.GlimmerComponent, 'Component'],
  [classes.EmberComponent, 'Component'],
]);

try {
  emberNames.set(Views.ViewStateSupport, 'ViewStateSupport Mixin');
  emberNames.set(Views.ViewMixin, 'View Mixin');
  emberNames.set(Views.ActionSupport, 'ActionSupport Mixin');
  emberNames.set(Views.ClassNamesSupport, 'ClassNamesSupport Mixin');
  emberNames.set(Views.ChildViewsSupport, 'ChildViewsSupport Mixin');
  emberNames.set(Views.ViewStateSupport, 'ViewStateSupport  Mixin');
  emberNames.set(classes.TargetActionSupport, 'TargetActionSupport Mixin');
  // this one is not a Mixin, but an .extend({}), which results in a class
  emberNames.set(Views.CoreView, 'CoreView');
} catch (e) {
  // do nothing
}

export default emberNames;
