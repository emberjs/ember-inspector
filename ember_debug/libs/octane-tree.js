export function makeRenderNodeCloneable(retainObject, renderNode) {
  let children = renderNode.children.map(child => makeRenderNodeCloneable(retainObject, child));

  return {
    // TODO add args and bounds
    value: {
      isComponent: renderNode.type === 'component',
      name: renderNode.name,
      objectId: renderNode.instance ? retainObject(renderNode.instance) : null,
      viewClass: renderNode.name
    },
    children
  };
}
