const captureRenderTree = window.Ember._captureRenderTree;

export default class CaptureRenderTree {
  constructor({ owner, retainObject, options}) {
    this.owner = owner;
    this.retainObject = obj => {
      if (obj === null) {
        return null;
      } else {
        switch (typeof obj) {
          case 'function':
          case 'object':
            return retainObject(obj);
          case 'symbol':
            throw new Error(`Cannot retain symbol: ${String(obj)}`);
          default:
            return obj;
        }
      }
    };

    console.info('initialized with options', options)
  }

  highlightLayer() {
    console.error("highlightLayer", [...arguments]);
    // alert("highlightLayer");
    throw new Error("Not implemented: highlightLayer");
  }

  updateOptions(options) {
    console.info('updateOptions', options)
  }

  modelForViewNodeValue() {
    console.error("modelForViewNodeValue", [...arguments]);
    // alert("modelForViewNodeValue");
    throw new Error("Not implemented: modelForViewNodeValue");
  }

  updateDurations() {
    console.info("updateDurations", [...arguments]);
    // alert("updateDurations");
    // throw new Error("Not implemented: updateDurations");
  }

  highlightLayer() {
    console.error("highlightLayer", [...arguments]);
    // alert("highlightLayer");
    throw new Error("Not implemented: highlightLayer");
  }

  build() {
    let captured = captureRenderTree(this.owner);
    let retained = captured.map(node => retainRenderNode(node, this.retainObject));
    console.info('retained', retained);
    return retained;
  }
}

/*

interface CapturedRenderNode {
  type: RenderNodeType;
  name: string;
  args: CapturedArguments;
  instance: unknown;
  bounds: Option<{
    parentElement: Simple.Element;
    firstNode: Simple.Node;
    lastNode: Simple.Node;
  }>;
  children: CapturedRenderNode[];
}

interface CapturedArguments {
  named: Dict;
  positional: unknown[];
}

*/

function retainRenderNode({ type, name, args, instance, bounds, children }, retain) {
  return {
    type,
    name,
    args: retainArgs(args, retain),
    instance: retain(instance),
    bounds: retain(bounds),
    children: children.map(child => retainRenderNode(child, retain)),
  };
}

function retainArgs({ positional, named }, retain) {
  let retained = {
    named: {},
    positional: positional.map(retain),
  };

  Object.keys(named).forEach(key => {
    retained.named[key] = retain(named[key]);
  });

  return retained;
}

function retain(obj, retainObject) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  } else {
    retainObject(obj)
  }
}
