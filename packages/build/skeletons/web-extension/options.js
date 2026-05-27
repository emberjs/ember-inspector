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
      id: 'vscode',
      name: 'VS Code',
      pattern: 'vscode://file/{{file}}',
    },
    {
      id: 'cursor',
      name: 'Cursor',
      pattern: 'cursor://file/{{file}}',
    },
    {
      id: 'zed',
      name: 'Zed',
      pattern: 'zed://file/{{file}}',
    },
    {
      id: 'sublime',
      name: 'Sublime Text',
      pattern: 'subl://open?url=file://{{file}}',
    },
  ];

  var CustomEditorPatternId = '_custom_';
  var NoSelectionId = 'no-selection';
  var EditorRadioGroupName = 'text-editor-selection';

  function setTomsterIconSetting(showTomster) {
    document.querySelector(TomsterSelector).checked = showTomster;
  }

  function EditorPickerComponent(options) {
    var container = document.createElement('div');
    var label = document.createElement('label');
    var input = document.createElement('input');

    input.type = 'radio';
    input.name = EditorRadioGroupName;
    input.checked = options.isChecked;

    input.addEventListener('change', options.onChange);

    label.appendChild(input);
    label.appendChild(document.createTextNode(options.label));
    container.appendChild(label);

    return container;
  }

  function OpenInEditorToggleComponent(options) {
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = options.isChecked;
    checkbox.id = 'open-in-editor-toggle';

    checkbox.addEventListener('change', options.onChange);

    var label = document.createElement('label');
    label.setAttribute('for', 'open-in-editor-toggle');
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode('Open files from the inspector in your preferred editor'));

    return label;
  }

  function renderCustomPatternOption(options) {
    var customStringTemplate = document.createElement('input');
    customStringTemplate.type = 'text';
    customStringTemplate.setAttribute('placeholder', 'editor://open?url={{file}}');

    if (options.isChecked && options.pattern) {
      customStringTemplate.value = options.pattern;
    }

    function saveCustom() {
      storeOptions({
        editor: CustomEditorPatternId,
        editorPattern: customStringTemplate.value || null,
      });
    }

    var container = EditorPickerComponent({
      isChecked: options.isChecked,
      label: 'Custom',
      onChange: saveCustom,
    });

    customStringTemplate.addEventListener('input', function () {
      if (container.querySelector('input[type=radio]').checked) {
        saveCustom();
      }
    });

    container.querySelector('label').appendChild(customStringTemplate);

    return container;
  }

  /*
    @options
      @selectedEditor: string
      @savedPattern: string template
  */
  function renderPreferredEditorIntegrationSettings(options) {
    var selectedEditor = options.selectedEditor;
    var savedPattern = options.savedPattern;
    var editorSelectionsContainer = document.querySelector('#editor-selections');

    var isEnabled = selectedEditor !== undefined && selectedEditor !== NoSelectionId;

    var editorList = document.createElement('div');
    editorList.className = 'editor-list';
    editorList.style.display = isEnabled ? '' : 'none';

    var editorGrid = document.createElement('div');
    editorGrid.className = 'editor-grid';

    var checkboxLabel = OpenInEditorToggleComponent({
      isChecked: isEnabled,
      onChange: function (event) {
        if (event.target.checked) {
          editorList.style.display = '';
        } else {
          editorList.style.display = 'none';
          storeOptions({ editor: NoSelectionId, editorPattern: null });
        }
      },
    });

    Editors.forEach(function (editor) {
      var id = editor.id;
      var name = editor.name;
      var pattern = editor.pattern;
      editorGrid.appendChild(
        EditorPickerComponent({
          editorId: id,
          isChecked: id === selectedEditor,
          label: name,
          onChange: function () {
            storeOptions({ editor: id, editorPattern: pattern });
          },
        })
      );
    });

    var customOption = renderCustomPatternOption({
      editorId: CustomEditorPatternId,
      isChecked: selectedEditor === CustomEditorPatternId,
      pattern: savedPattern,
    });
    customOption.className = (customOption.className ? customOption.className + ' ' : '') + 'editor-custom';

    editorList.appendChild(editorGrid);
    editorList.appendChild(customOption);

    var fragment = document.createDocumentFragment();
    fragment.appendChild(checkboxLabel);
    fragment.appendChild(editorList);
    editorSelectionsContainer.appendChild(fragment);
  }

  /**
   * Load the options from storage.
   */
  function initialRender() {
    chrome.storage.sync.get('options', function (data) {
      var options = data.options || {};
      setTomsterIconSetting(options.tomster);
      renderPreferredEditorIntegrationSettings({
        selectedEditor: options.editor,
        savedPattern: options.editorPattern,
      });
    });
  }

  /**
   * Accepts a new set of options, merges them with existing options already
   * stored in `chrome.storage` and saves the union of both to storage.
   */
  function storeOptions(newOptions) {
    console.log('change Options:', newOptions);
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

  document.addEventListener('DOMContentLoaded', initialRender);
  document
    .querySelector('[data-settings=tomster]')
    .addEventListener('click', saveTomsterSetting);
})();
