<div class="error-page box-border overflow-auto absolute inset-0 flex text-base13 text-md bg-base02">
  <div class="error-page-content box-border relative m-auto px-6 pb-6 rounded bg-base00">
    <div class="error-page-header overflow-hidden relative flex items-center font-bold text-4xl">
      <div class="flex-grow pt-6">
        {{@description}}
      </div>
      <img class="tomster" src="assets/images/fishy_tomster.png" alt="Fishy Tomster">
    </div>

    <div class="error-page-body pb-2">
      <div class="font-bold">
        Here are some common reasons this happens:
      </div>

      {{yield}}
    </div>

    <div class="pt-2">
      If you're still having trouble, please file an issue on the Ember Inspector's
      <a href="https://github.com/emberjs/ember-inspector/issues" target="_blank" rel="noopener noreferrer">GitHub page.</a>
    </div>
  </div>
</div>
