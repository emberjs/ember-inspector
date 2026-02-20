/*global chrome*/

/**
 * Extension options for Chrome.
 * This allows the user to decide if the Ember icon should show when visiting
 * a webpage that has Ember running.
 *
 * see:
 *     https://developer.chrome.com/extensions/options
 */
(function () {
  'use strict';

  /**
   * Load the options from storage.
   */
  function loadOptions() {
    chrome.storage.sync.get('options', function (data) {
      var options = data.options;

      document.querySelector('[data-settings=tomster]').checked =
        options && options.showTomster;
    });
  }

  /**
   * Accepts a new set of options, merges them with existing options already
   * stored in `chrome.storage` and saves the union of both to storage.
   */
  function storeOptions(newOptions) {
    chrome.storage.sync.get('options', function (data) {
      var options = data.options || {};
      Object.assign(options, newOptions);

      chrome.storage.sync.set(
        {
          options: options,
        },
        function optionsSaved() {
          console.log('saved!', newOptions);
        },
      );
    });
  }

  /**
   * Save the updated Tomster setting to storage.
   */
  function saveTomsterSetting() {
    storeOptions({ showTomster: this.checked });
  }

  document.addEventListener('DOMContentLoaded', loadOptions);
  document
    .querySelector('[data-settings=tomster]')
    .addEventListener('click', saveTomsterSetting);
})();
