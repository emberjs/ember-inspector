import RouteTemplate from 'ember-route-template';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import onResize from 'ember-on-resize-modifier/modifiers/on-resize';
import DraggableColumn from 'ember-inspector/components/ui/draggable-column';
import AppPicker from 'ember-inspector/components/app-picker';
import SideNav from 'ember-inspector/components/side-nav';
import svgJar from 'ember-svg-jar/helpers/svg-jar';
import Toggle from 'ember-inspector/components/object-inspector/toggle';
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
import ObjectInspector from 'ember-inspector/components/object-inspector';
import ErrorPage from 'ember-inspector/components/ui/error-page';
export default RouteTemplate(
  <template>
    <div
      class="ember-view app absolute inset-0 z-0
        {{if @controller.active '' 'inactive'}}"
      tabindex="1"
      {{on "focusin" (fn @controller.setActive true)}}
      {{on "focusout" (fn @controller.setActive false)}}
      {{onResize @controller.windowDidResize}}
    >
      {{#if @controller.isEmberApplication}}
        <div class="split">
          <div class="split-panel">
            <div class="split split-main">
              <DraggableColumn
                @classes="split-panel split-panel-sidebar-1"
                @side="left"
                @width={{@controller.navWidth}}
              >
                <div class="split-panel-hd">
                  <AppPicker @collapsed={{@controller.navIsCollapsed}} />
                </div>

                <SideNav
                  class="split-panel-bd"
                  @collapsed={{@controller.navIsCollapsed}}
                  @deprecationCount={{@controller.deprecationCount}}
                />

                <div
                  class="split-panel-ft nav-footer
                    {{if
                      @controller.navIsCollapsed
                      'nav-collapsed'
                      'nav-expanded'
                    }}"
                >
                  <a
                    target="_blank"
                    title="Submit an Issue"
                    class="navigation-submit-issue flex items-center justify-center px-3"
                    href="https://github.com/emberjs/ember-inspector/issues"
                    rel="noopener noreferrer"
                  >
                    {{svgJar "nav-bug" width="18" height="18"}}
                  </a>
                  <button
                    {{on "click" @controller.toggleNavCollapsed}}
                    title="{{if
                      @controller.navIsCollapsed
                      'expand'
                      'collapse'
                    }} navigation"
                    type="button"
                    class="navigation-toggle flex items-center bg-transparent border-0 outline-none appearance-none px-3"
                  >
                    {{svgJar "sidebar-toggle" width="16" height="16"}}
                  </button>
                </div>
              </DraggableColumn>

              <div class="split-panel">
                <div class="split-panel-hd split-panel-hd-row">
                  <div id="toolbar"></div>
                  {{#unless @controller.layout.inspectorExpanded}}
                    <span
                      class="spacer"
                    >{{!  Spacer to shift the toggle to the end of the header }}</span>
                    <Toggle />
                  {{/unless}}
                </div>

                <div
                  class="split-panel-bd"
                  {{didInsert @controller.setupContentElement}}
                >
                  {{outlet}}
                </div>
              </div>
            </div>
          </div>

          {{#if @controller.layout.inspectorExpanded}}
            <DraggableColumn
              @classes="split-panel"
              @side="right"
              @width={{@controller.inspectorWidth}}
            >
              <div class="split-panel-hd split-panel-hd-row">
                <span class="spacer"></span>
                <Toggle />
              </div>
              <ObjectInspector
                @popMixinDetails={{@controller.popMixinDetails}}
                @model={{@controller.mixinStack}}
                @mixinDetails={{@controller.mixinDetails}}
                @selectComponent={{mut
                  @controller.componentTreeController.pinned
                }}
                @item={{@controller.componentTreeController.currentItem}}
              />
            </DraggableColumn>
          {{/if}}
        </div>
      {{else}}
        <ErrorPage @description="Ember application not detected!">
          <ul>
            <li>This is not an Ember application.</li>
            <li>You might need to setup
              <a
                href="https://github.com/embroider-build/embroider/tree/main/packages/legacy-inspector-support"
              >legacy inspector support</a></li>
            <li>You are using an old version of Ember (&lt; rc5).</li>
            {{#if @controller.isChrome}}
              <li>
                You are using the file:// protocol (instead of http://), in
                which case:

                <ul>
                  <li>Visit the URL: chrome://extensions.</li>
                  <li>Find the Ember Inspector.</li>
                  <li>Make sure "Allow access to file URLs" is checked.</li>
                </ul>
              </li>
            {{/if}}
          </ul>
        </ErrorPage>
      {{/if}}
    </div>
  </template>,
);
