import { action } from '@ember/object';
 import Component from '@ember/component';
 
 export default Component.extend({
   tagName: '',
 
   isExpanded: false,
 
   toggle: action(function () {
     this.toggleProperty('isExpanded');
   }),
 });
 