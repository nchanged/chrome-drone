exports.escapeCSSSelector = (selector) => {
  return selector.replace(/'/g, '\\\'');
};

exports.evaluateOnNode = async (drone, node, fnToExecute) => {
  const resolvedNode        = await drone.protocol.DOM.resolveNode(node);
  const functionDeclaration = `() => { return (${fnToExecute})() }`;
  await drone.protocol.Runtime.enable();
  await drone.protocol.Runtime.callFunctionOn({ objectId: resolvedNode.object.objectId, functionDeclaration });
};

// Returns the NodeId object associated with the provided selector
exports.querySelector = async (drone, selector) => {
  const { DOM }  = drone.protocol;
  const document = await DOM.getDocument();
  const node       = document.root;
  return await DOM.querySelector({nodeId: node.nodeId, selector: selector});
};

exports.sleep = async (ms) => {
  await new Promise((resolve) => { setTimeout(resolve, ms); });
};
