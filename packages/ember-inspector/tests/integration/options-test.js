import { module, test } from 'qunit';

module('Integration | Options Page', function (hooks) {
  let container, storedOptions, originalChrome;

  function createChromeMock(initialOptions) {
    storedOptions = initialOptions || {};
    return {
      storage: {
        sync: {
          get(_key, cb) {
            cb({ options: Object.assign({}, storedOptions) });
          },
          set(data, cb) {
            Object.assign(storedOptions, data.options);
            if (cb) cb();
          },
        },
      },
    };
  }

  hooks.beforeEach(function () {
    originalChrome = window.chrome;

    container = document.createElement('div');
    container.innerHTML = `
      <input type="checkbox" data-settings="tomster">
      <div id="editor-selections"></div>
    `;
    document.body.appendChild(container);
  });

  hooks.afterEach(function () {
    container.remove();
    window.chrome = originalChrome;
  });

  async function loadOptionsPage() {
    const src = await (await fetch('/options.js')).text();
    // eval the IIFE in a scope where `chrome` is the mock
    eval(src);
    // DOMContentLoaded has already fired, so dispatch it manually
    // to trigger initialRender
    document.dispatchEvent(new Event('DOMContentLoaded'));
  }

  test('renders editor radio buttons', async function (assert) {
    const chrome = createChromeMock();
    window.chrome = chrome;
    await loadOptionsPage(chrome);

    const radios = container.querySelectorAll(
      'input[type=radio][name=text-editor-selection]',
    );
    assert.true(radios.length > 0, 'editor radio buttons are rendered');

    const labels = [...container.querySelectorAll('.editor-grid label')].map(
      (l) => l.textContent,
    );
    // Just picked on at random to verify.
    assert.true(labels.includes('VS Code'), 'VS Code option exists');
  });

  test('selecting an editor stores the correct pattern', async function (assert) {
    const chrome = createChromeMock();
    window.chrome = chrome;
    await loadOptionsPage(chrome);

    // First enable the toggle
    const toggle = container.querySelector('#open-in-editor-toggle');
    toggle.checked = true;
    toggle.dispatchEvent(new Event('change'));

    const radios = container.querySelectorAll('.editor-grid input[type=radio]');

    radios[0].checked = true;
    radios[0].dispatchEvent(new Event('change'));

    assert.strictEqual(storedOptions.editor, 'vscode', 'editor id is stored');
    assert.strictEqual(
      storedOptions.editorPattern,
      'vscode://file/{{file}}',
      'editor pattern is stored',
    );
  });

  test('selecting a different editor updates storage', async function (assert) {
    const chrome = createChromeMock({
      editor: 'vscode',
      editorPattern: 'vscode://file/{{file}}',
    });
    window.chrome = chrome;
    await loadOptionsPage(chrome);

    const radios = container.querySelectorAll('.editor-grid input[type=radio]');

    // Find and click Sublime Text (second radio)
    radios[1].checked = true;
    radios[1].dispatchEvent(new Event('change'));

    assert.strictEqual(
      storedOptions.editor,
      'cursor',
      'editor id updated to sublime',
    );
    assert.strictEqual(
      storedOptions.editorPattern,
      'cursor://file/{{file}}',
      'editor pattern updated to cursor pattern',
    );
  });

  test('disabling the toggle stores no-selection', async function (assert) {
    const chrome = createChromeMock({ editor: 'vscode' });
    window.chrome = chrome;
    await loadOptionsPage(chrome);

    const toggle = container.querySelector('#open-in-editor-toggle');
    toggle.checked = false;
    toggle.dispatchEvent(new Event('change'));

    assert.strictEqual(
      storedOptions.editor,
      'no-selection',
      'editor is set to no-selection',
    );
    assert.strictEqual(
      storedOptions.editorPattern,
      null,
      'editor pattern is cleared',
    );
  });

  test('previously selected editor is checked on load', async function (assert) {
    const chrome = createChromeMock({
      editor: 'cursor',
      editorPattern: 'cursor://file/{{file}}',
    });
    window.chrome = chrome;
    await loadOptionsPage(chrome);

    const checkedRadio = container.querySelector(
      '.editor-grid input[type=radio]:checked',
    );

    assert.ok(checkedRadio, 'a radio is checked');
    assert.strictEqual(
      checkedRadio.closest('label').textContent,
      'Cursor',
      'Cursor radio is the checked one',
    );
  });

  test('custom editor pattern can be entered', async function (assert) {
    const chrome = createChromeMock();
    window.chrome = chrome;
    await loadOptionsPage(chrome);

    // Enable the toggle
    const toggle = container.querySelector('#open-in-editor-toggle');
    toggle.checked = true;
    toggle.dispatchEvent(new Event('change'));

    // Select the custom radio
    const customRadio = container.querySelector(
      '.editor-custom input[type=radio]',
    );
    customRadio.checked = true;
    customRadio.dispatchEvent(new Event('change'));

    assert.strictEqual(
      storedOptions.editor,
      '_custom_',
      'custom editor id is stored',
    );

    // Type a custom pattern
    const customInput = container.querySelector(
      '.editor-custom input[type=text]',
    );
    customInput.value = 'myeditor://open?file={{file}}';
    customInput.dispatchEvent(new Event('input'));

    assert.strictEqual(
      storedOptions.editorPattern,
      'myeditor://open?file={{file}}',
      'custom pattern is stored',
    );
  });
});
