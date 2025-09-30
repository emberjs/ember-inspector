import { compareVersion } from '../utils/version';
import {
  VERSION,
  ActionHandler,
  ControllerMixin,
  CoreObject,
  MutableEnumerable,
  NativeArray,
  MutableArray,
  Component,
  Evented,
  InternalsRuntime,
  InternalsViews,
  PromiseProxyMixin,
  EmberObject,
  Observable,
} from '../utils/ember';

/**
 * Add Known Ember Mixins and Classes so we can label them correctly in the inspector
 */
const emberNames = new Map([
  [Evented, 'Evented Mixin'],
  [PromiseProxyMixin, 'PromiseProxy Mixin'],
  [MutableArray, 'MutableArray Mixin'],
  [MutableEnumerable, 'MutableEnumerable Mixin'],
  [NativeArray, 'NativeArray Mixin'],
  [Observable, 'Observable Mixin'],
  [ControllerMixin, 'Controller Mixin'],
  [CoreObject, 'CoreObject'],
  [EmberObject, 'EmberObject'],
  [Component, 'Component'],
]);

if (ActionHandler) {
  emberNames.set(ActionHandler, 'ActionHandler Mixin');
}

if (compareVersion(VERSION, '3.27.0') === -1) {
  const TargetActionSupport = InternalsRuntime?.TargetActionSupport;
  emberNames.set(TargetActionSupport, 'TargetActionSupport Mixin');
}

try {
  const Views = InternalsViews || {};
  emberNames.set(Views.ViewStateSupport, 'ViewStateSupport Mixin');
  emberNames.set(Views.ViewMixin, 'View Mixin');
  emberNames.set(Views.ActionSupport, 'ActionSupport Mixin');
  emberNames.set(Views.ClassNamesSupport, 'ClassNamesSupport Mixin');
  emberNames.set(Views.ChildViewsSupport, 'ChildViewsSupport Mixin');
  emberNames.set(Views.ViewStateSupport, 'ViewStateSupport  Mixin');
  // this one is not a Mixin, but an .extend({}), which results in a class
  emberNames.set(Views.CoreView, 'CoreView');
} catch {
  // do nothing
}

export default emberNames;
