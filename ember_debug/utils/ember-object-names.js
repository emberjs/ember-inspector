import Ember from 'ember-debug/utils/ember';
import MutableArray from 'ember-debug/utils/ember/array/mutable';
import Component from 'ember-debug/utils/ember/component';
import Observable from 'ember-debug/utils/ember/object/observable';
import Evented from 'ember-debug/utils/ember/object/evented';
import PromiseProxyMixin from 'ember-debug/utils/ember/object/promise-proxy-mixin';
import EmberObject from 'ember-debug/utils/ember/object';
import { compareVersion } from 'ember-debug/utils/version';

const {
  VERSION,
  ActionHandler,
  ControllerMixin,
  CoreObject,
  MutableEnumerable,
  NativeArray,
} = Ember;

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
  [ActionHandler, 'ActionHandler Mixin'],
  [CoreObject, 'CoreObject'],
  [EmberObject, 'EmberObject'],
  [Component, 'Component'],
]);

if (compareVersion(VERSION, '3.27.0') === -1) {
  emberNames.set(Ember.TargetActionSupport, 'TargetActionSupport Mixin');
}

try {
  const Views = Ember.__loader.require('@ember/-internals/views');
  emberNames.set(Views.ViewStateSupport, 'ViewStateSupport Mixin');
  emberNames.set(Views.ViewMixin, 'View Mixin');
  emberNames.set(Views.ActionSupport, 'ActionSupport Mixin');
  emberNames.set(Views.ClassNamesSupport, 'ClassNamesSupport Mixin');
  emberNames.set(Views.ChildViewsSupport, 'ChildViewsSupport Mixin');
  emberNames.set(Views.ViewStateSupport, 'ViewStateSupport  Mixin');
  // this one is not a Mixin, but an .extend({}), which results in a class
  emberNames.set(Views.CoreView, 'CoreView');
} catch (e) {
  // do nothing
}

export default emberNames;
