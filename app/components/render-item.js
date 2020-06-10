import Component from '@ember/component';
import { isNone, isEmpty } from '@ember/utils';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import escapeRegExp from 'ember-inspector/utils/escape-reg-exp';

import { gt } from '@ember/object/computed';

export default Component.extend({
  tagName: '',

  searchMatch: computed('model.name', 'name', 'search', function () {
    let search = this.search;
    if (isEmpty(search)) {
      return true;
    }
    let name = this.get('model.name');
    let regExp = new RegExp(escapeRegExp(search.toLowerCase()));
    return !!name.toLowerCase().match(regExp);
  }),

  nodeStyle: computed('searchMatch', function () {
    let style = '';
    if (!this.searchMatch) {
      style = 'opacity: 0.5;';
    }
    return htmlSafe(style);
  }),

  level: computed('target.level', function () {
    let parentLevel = this.get('target.level');
    if (isNone(parentLevel)) {
      parentLevel = -1;
    }
    return parentLevel + 1;
  }),

  nameStyle: computed('level', function () {
    return htmlSafe(`padding-left: ${+this.level * 20 + 5}px;`);
  }),

  hasChildren: gt('model.children.length', 0),

  readableTime: computed('model.timestamp', function () {
    let d = new Date(this.get('model.timestamp'));
    let ms = d.getMilliseconds();
    let seconds = d.getSeconds();
    let minutes =
      d.getMinutes().toString().length === 1
        ? `0${d.getMinutes()}`
        : d.getMinutes();
    let hours =
      d.getHours().toString().length === 1 ? `0${d.getHours()}` : d.getHours();

    return `${hours}:${minutes}:${seconds}:${ms}`;
  }),
});
