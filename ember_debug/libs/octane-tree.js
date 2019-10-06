const Ember = window.Ember;
const {
  assert
} = Ember;

export function makeRenderNodeCloneable(retainObject, renderNode) {
  if (renderNode.type === 'outlet') {
    assert('outlet node should have exactly one child', renderNode.children.length === 1);
    return makeRenderNodeCloneable(retainObject, renderNode.children[0]);
  } else {
    let children = renderNode.children.map(child => makeRenderNodeCloneable(retainObject, child));

    return {
      value: {
        args: renderNode.args,
        bounds: renderNode.bounds,
        isComponent: renderNode.type === 'component',
        name: renderNode.name,
        objectId: renderNode.instance ? retainObject(renderNode) : null,
        viewClass: renderNode.name
      },
      children
    };
  }
}
