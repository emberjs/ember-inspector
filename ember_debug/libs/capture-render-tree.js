/* eslint-disable no-console, no-inner-declarations */

const Ember = window.Ember;

let captureRenderTree;

if (Ember._captureRenderTree) {
  // 3.14+
  if (Ember.ENV._DEBUG_RENDER_TREE) {
    captureRenderTree = Ember._captureRenderTree;
  } else {
    captureRenderTree = function captureRenderTree() {
      return [];
    };
  }
} else {
  /**
   * Best-effort polyfill for `Ember._captureRenderTree`.
   *
   * Just like the Ember API, it takes an owner (`ApplicationInstance`, specifically)
   * and return an array of render nodes:
   *
   * interface CapturedRenderNode {
   *   id: string;
   *   type: 'outlet' | 'engine' | 'route-template' | 'component';;
   *   name: string;
   *   args: {
   *     named: Dict<unknown>;
   *     positional: unknown[];
   *   };
   *   instance: unknown;
   *   template: Option<string>;
   *   bounds: Option<{
   *     parentElement: Simple.Element;
   *     firstNode: Simple.Node;
   *     lastNode: Simple.Node;
   *   }>;
   *   children: CapturedRenderNode[];
   * }
   *
   * While the API is identical, there are some differences and limitations:
   *
   * 1. `args` property is not available (it always report empty args).
   * 2. `bounds` property is only available on component nodes (`null` everywhere else).
   * 3. `{{mount}}` does not insert an `engine` node.
   * 4. `Ember.Component` (classic components) are the only type of component in the tree
   *    (other components are skipped over).
   * 5. Ordering of `children` may be different (but this is also not guarenteed in the
   *    Ember API).
   */

  const { Controller, ViewUtils, get, getOwner, guidFor } = Ember;
  const { getRootViews, getChildViews, getViewBounds } = ViewUtils;

  /**
   * We are building the final tree by doing the following steps:
   *
   * 1. Get the "outlet state" tree from the router.
   * 2. Collect the "top level" components. That is, components rendered directly from within
   *    a route template.
   * 3. Do an "interleaved walk" down the outlet and (classic) component tree and map things
   *    into render nodes.
   * 4. Return the array of render nodes we captured.
   *
   * Usually, this function returns an array of exactly one render node, which is the "root"
   * outlet. However, sometimes there may be other top-level components in the app (e.g.
   * rendered using the `Ember.Component#appendTo` API).
   */
  captureRenderTree = function captureRenderTree(owner) {
    let tree = [];
    let outletState = getOutletState(owner);
    let components = getTopLevelComponents(owner);

    if (outletState && components) {
      tree.push(captureOutlet(null, 'root', owner, components, outletState));
    }

    return tree;
  };

  /**
   * Get the "outlet state" tree from the router. It corresponds to the "settled",
   * app state after resolving all the hooks, redirects, etc. The rendering layer
   * takes this tree from the router and render it on screen.
   *
   * It has the following format:
   *
   * interface OutletState {
   *   render: {
   *     // The current owner, could be the app or an engine
   *     owner: Owner;
   *
   *     // The name of the route
   *     name: string;
   *
   *     // The controller for the route
   *     controller: Controller;
   *
   *     // The template (or template factory?) for the route (can this really be undefined?)
   *     template: OwnedTemplate | undefined;
   *
   *     // The name of the outlet this was rendered into (in the parent route template)
   *     outlet: string;
   *
   *     // The name of the parent route (we don't use this)
   *     into: string | undefined;
   *   },
   *
   *   // The children outlets of this route, keyed by the outlet names (e.g. "main", "sidebar", ...)
   *   outlets: Dict<OutletState | undefined>;
   * }
   *
   * This function returns the "root" outlet state.
   */
  function getOutletState(owner) {
    try {
      return owner.lookup('router:main')._toplevelView.state.ref.value();
    } catch(error) {
      console.log('[Ember Inspector] failed to capture render tree');
      console.log(error);
      return undefined;
    }
  }

  /**
   * Collect the "top level" components. That is, components rendered directly
   * from within a route template.
   *
   * We do this by walking the classic component tree and identify components
   * that has its "target" (~= the parent template's `{{this}}` object) set to
   * a controller (or undefined, for root components rendered outside of the
   * application route).
   *
   * This function returns a `Map` keyed by controllers (`undefiend` is also a
   * possible key) to arrays of top-level components for that route/controller.
   */
  function getTopLevelComponents(owner) {
    try {
      let map = new Map();
      collectComponentsByController(map, getRootViews(owner));
      return map;
    } catch(error) {
      console.log('[Ember Inspector] failed to capture render tree');
      console.log(error);
      return undefined;
    }
  }

  /**
   * Returns the "target" of a (classic) component.
   */
  function targetForComponent(component) {
    return get(component, '_target') || get(component, '_targetObject');
  }

  /**
   * Recursively walk an array of components and add any "top level" components
   * to the map keyed by their controller.
   */
  function collectComponentsByController(map, components) {
    components.forEach(component => {
      let target = targetForComponent(component);

      if (target === undefined || target instanceof Controller) {
        if (!map.has(target)) {
          map.set(target, []);
        }

        map.get(target).push(component);

        collectComponentsByController(map, getChildViews(component));
      }
    });
  }

  const EMPTY_ARGS = {
    named: Object.create(null),
    positional: [],
  };

  /**
   * Return the module name (e.g. `my-app/templates/application.hbs`) for a
   * template or template factory, if available. This may not be present for,
   * e.g. templates compiled using the "inline" `hbs` tagged string method.
   */
  function nameForTemplate(template) {
    if (template.meta) {
      // Factory
      return template.meta.moduleName || null;
    } else if (template.referrer) {
      // Instance
      return template.referrer.moduleName || null;
    } else {
      return null;
    }
  }

  /**
   * Walk an outlet tree (the last parameter) and map its content into render nodes.
   *
   * For each level of the outlet tree, we also have to walk the (classic) component
   * tree to attach any components for the current level (and their children) to the
   * resulting render nodes tree.
   *
   * We also check if the owner has changed between the current level and the previous
   * level, and if so, we infer that we must have just crossed an engine boundary and
   * insert an engine render node to account for that.
   *
   * Because we don't have a good way to generate a stable ID for the outlet nodes, we
   * also pass down a "path" of the routes/outlets we have encountered so far which we
   * use to generate the ID.
   */
  function captureOutlet(parent, path, owner, components, { outlets, render }) {
    let outlet = {
      id: `render-node:${path}@${render.outlet}`,
      type: 'outlet',
      name: render.outlet,
      args: EMPTY_ARGS,
      instance: undefined,
      bounds: null,
      children: [],
    };

    if (parent) {
      parent.children.push(outlet);
    }

    parent = outlet;

    if (owner !== render.owner) {
      let engine = {
        id: `render-node:${guidFor(render.owner)}`,
        type: 'engine',
        name: render.owner.mountPoint,
        args: EMPTY_ARGS,
        instance: render.owner,
        bounds: null,
        children: [],
      };

      parent.children.push(engine);
      parent = engine;
    }

    let subpath = `${path}@${render.outlet}/${render.name}`;

    let route = {
      id: `render-node:${subpath}`,
      type: 'route-template',
      name: render.name,
      args: EMPTY_ARGS,
      instance: render.controller,
      template: nameForTemplate(render.template),
      bounds: null,
      children: [],
    };

    parent.children.push(route);
    parent = route;

    Object.keys(outlets).forEach(name => {
      captureOutlet(parent, subpath, render.owner, components, outlets[name]);
    });

    captureComponents(parent, components.get(render.controller) || [], render.controller);

    return outlet;
  }

  /**
   * Returns the name of a (classic) component.
   */
  function nameForComponent(component) {
    // remove "component:" prefix
    return component._debugContainerKey.slice(10);
  }

  /**
   * Returns the nearest controller of a (classic) component. This is so that we know
   * whether a given component belongs to the current level (the route that we are
   * processing right now) or not.
   */
  function controllerForComponent(component) {
    let target = component;

    while (target && !(target instanceof Controller)) {
      target = targetForComponent(target);
    }

    return target;
  }

  /**
   * Returns the template (or template factory?) for a (classic) component.
   */
  function templateForComponent(component) {
    let layout = get(component, 'layout');

    if (layout) {
      return nameForTemplate(layout);
    }

    let layoutName = get(component, 'layoutName');

    if (layoutName) {
      let owner = getOwner(component);
      let template = owner.lookup(`template:${layoutName}`);
      return nameForTemplate(template);
    }

    return null;
  }

  /**
   * Return the render node for a given (classic) component, and its children up
   * until the next route boundary.
   */
  function captureComponents(parent, components, controller) {
    components.forEach(component => {
      if (controllerForComponent(component) === controller) {
        let node = {
          id: `render-node:${guidFor(component)}`,
          type: 'component',
          name: nameForComponent(component),
          args: EMPTY_ARGS,
          instance: component,
          template: templateForComponent(component),
          bounds: getViewBounds(component),
          children: [],
        };

        parent.children.push(node);

        captureComponents(node, getChildViews(component), controller);
      }
    });
  }
}

export default captureRenderTree;
