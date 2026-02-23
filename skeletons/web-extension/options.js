/*global chrome*/

/**
 * Extension options for Chrome.
 * This allows the user to decide if the Ember icon should show when visiting
 * a webpage that has Ember running and specify which text editor should be used
 * for opening files from the inspector
 *
 * see:
 *     https://developer.chrome.com/extensions/options
 */
(function () {
  'use strict';

  var TomsterSelector = '[data-settings=tomster]';
  var Editors = [
    {
      id: 'no-selection',
      name: 'Do not open in editor',
      pattern: '{{file}}',
    },
    {
      id: 'vscode',
      name: 'VS Code',
      pattern: 'vscode://file/{{file}}',
    },
    {
      id: 'sublime',
      name: 'Sublime Text',
      pattern: 'subl://open?url=file://{{file}}',
    },
    {
      id: 'jetbrains',
      name: 'JetBrains IDEs (IntelliJ IDEA / WebStorm / PyCharm)',
      pattern: 'idea://open?file={{file}}',
    },
    {
      id: 'atom',
      name: 'Atom',
      pattern: 'atom://core/open/file?filename={{file}}',
    },
    {
      id: 'vim',
      name: 'Vim',
      pattern: 'vim://open?url=file://{{file}}',
    },
    {
      id: 'neovim',
      name: 'Neovim',
      pattern: 'nvim://open?url=file://{{file}}',
    },
    {
      id: 'textmate',
      name: 'TextMate',
      pattern: 'txmt://open?url=file://{{file}}',
    },
    {
      id: 'zed',
      name: 'Zed',
      pattern: 'zed://file/{{file}}',
    },
    {
      id: 'custom',
      name: 'Custom URL',
      pattern: '{{file}}',
    },
  ];

  function setTomsterIconSetting(showTomster) {
    document.querySelector(TomsterSelector).checked = showTomster;
  }

  function loadTextEditorSetting(selectedEdtor, savedPattern) {
    selectedEdtor = selectedEdtor || 'no-selection';

    var editorSelectionsContainer =
      document.querySelector('#editor-selections');
    for (var editor of Editors) {
      var { id, name, pattern } = editor;

      var container = document.createElement('div');
      var label = document.createElement('label');
      var input = document.createElement('input');

      input.type = 'radio';
      input.name = 'text-editor-selection';
      input.setAttribute('data-settings-editor', id);

      if (id === selectedEdtor) {
        input.checked = true;
      }

      // Add event listener to save editor selection when changed
      input.addEventListener('change', function () {
        saveEditorSelection();
      });

      label.appendChild(input);
      label.appendChild(document.createTextNode(' ' + name));
      container.appendChild(label);

      if (id === 'custom') {
        var customStringTemplate = document.createElement('input');
        customStringTemplate.setAttribute('placeholder', pattern);
        customStringTemplate.setAttribute('data-custom-pattern', '');

        // Restore saved custom pattern if custom editor was selected
        if (
          selectedEdtor === 'custom' &&
          savedPattern &&
          savedPattern !== pattern
        ) {
          customStringTemplate.value = savedPattern;
        }

        label.appendChild(customStringTemplate);

        // Save custom pattern on input
        customStringTemplate.addEventListener('input', function () {
          saveEditorSelection();
        });
      }

      editorSelectionsContainer.appendChild(container);
    }
  }

  /**
   * Load the options from storage.
   */
  function initialRender() {
    chrome.storage.sync.get('options', function (data) {
      var options = data.options || {};
      setTomsterIconSetting(options.tomster);
      loadTextEditorSetting(options.editor, options.editorPattern);
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

    /**
   * Save the updated preferred text editor integration selection to storage.
   */
  function saveEditorSelection() {
    var selectedInput = document.querySelector(
      'input[name="text-editor-selection"]:checked',
    );
    if (!selectedInput) return;

    var selectedEditorId = selectedInput.getAttribute('data-settings-editor');
    var selectedEditor = Editors.find(function (e) {
      return e.id === selectedEditorId;
    });

    if (!selectedEditor) return;

    var editorPattern = null;

    // Only save pattern if not 'no-selection'
    if (selectedEditorId !== 'no-selection') {
      editorPattern = selectedEditor.pattern;

      // Handle custom pattern
      if (selectedEditorId === 'custom') {
        var customInput = document.querySelector('input[data-custom-pattern]');
        if (customInput && customInput.value) {
          editorPattern = customInput.value;
        }
      }
    }

    storeOptions({
      editor: selectedEditorId,
      editorPattern: editorPattern,
    });
  }

  document.addEventListener('DOMContentLoaded', initialRender);
  document
    .querySelector('[data-settings=tomster]')
    .addEventListener('click', saveTomsterSetting);
})();
