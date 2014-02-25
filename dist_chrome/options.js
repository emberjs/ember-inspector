(function() {
  "use strict";

  function loadOptions() {
    chrome.storage.sync.get('options', function(data) {
      var options = data.options;

      document.querySelector('[data-settings=tomster]').checked = options.showTomster;
    });
  }

  function storeOptions() {
    /*jshint validthis:true */
    var showTomster = this.checked;

    chrome.storage.sync.set({
      options: { showTomster: showTomster }
    }, function optionsSaved() {
      console.log("saved!");
    });
  }

  document.addEventListener('DOMContentLoaded', loadOptions);
  document.querySelector('[data-settings=tomster]').addEventListener('click', storeOptions);

}());
