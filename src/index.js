const fs             = require('fs');
const chromeLauncher = require('chrome-launcher');
const CDP            = require('chrome-remote-interface');
const { escapeCSSSelector,
        evaluateOnNode,
        querySelector,
        sleep }      = require('./utils');

exports.createDrone = async ({headless = true, disableGPU = true, port = 0}) => {
  const chromeOptions   = {port:         port,
                           chromeFlags:  [headless   ? '--headless'    : '',
                                          disableGPU ? '--disable-gpu' : ''],
                           handleSIGINT: true,
                           logLevel:     'error'};
  const chromeInstance  = await chromeLauncher.launch(chromeOptions);
  const remoteInterface = await CDP({port: chromeInstance.port});
  await Promise.all([remoteInterface.Page.enable(), remoteInterface.Runtime.enable()]);
  return {chrome:   chromeInstance,
          protocol: remoteInterface,
          options:  {typeInterval: 20}};
};

/*
 * Returns nothing executed for side effect of navigating drone instance to the
 * provided url
 */
exports.goTo = async (drone, url) => {
  await drone.protocol.Page.navigate({url: url});
  await drone.protocol.Page.loadEventFired();
};

/*
 * Returns nothing executed for side effect of setting value of provided node
 * object in provided drone to provided value
 */
exports.setValue = async (drone, selector, desiredValue) => {
  const node = await querySelector(drone, selector);
  await drone.protocol.DOM.setAttributeValue({nodeId: node.nodeId, name: 'value', value: desiredValue});
};

/*
 * Returns nothing executed for side effect of typing the provided value into
 * the node object matching the provided selector.
 * Use in place of `setValue` when keyboard events must be triggered
 */
exports.typeValue = async (drone, selector, value) => {
  const code = String.raw`let keyUpEvent = new Event('keyup');
                          document.querySelector('${selector}').dispatchEvent(keyUpEvent)`;
  await drone.protocol.Runtime.evaluate({expression: `document.querySelector("${selector}").focus();`});
  value.split('').forEach(async (char) => {
    await drone.protocol.Input.dispatchKeyEvent({type: 'char', text: char});
    await sleep(drone.options.typeInterval);
  });
  await drone.protocol.Runtime.evaluate({expression: code});
};

/*
 * Returns nothing executed for side effect of clicking the provided css
 * selector in the provided drone instant
 */
exports.click = async (drone, selector) => {
  const node     = await querySelector(drone, selector);
  const evalExpr = `document.querySelector('${escapeCSSSelector(selector)}').click()`;
  await evaluateOnNode(drone, node, evalExpr);
};

/*
 * Returns the response returned from the provided drone instance when the
 * provided js is executed in it
 */
exports.evaluate = async (drone, jsToExecute) => {
  const response = await drone.protocol.Runtime.evaluate({expression: jsToExecute});
  return response.result.value;
};

/*
 * Returns nothing executed for the side effect of waiting for the page load
 * event and the provided drone instance
 */
exports.waitForPageLoad = async (drone) => {
  await drone.protocol.Page.loadEventFired();
};

exports.exist = async (drone, selector) => {
  return await module.exports.evaluate(drone, `!!document.querySelector('${escapeCSSSelector(selector)}');`);
};

exports.waitForSelector = async (drone, selector, intervalMS=250, timeoutMS=500) => {
  const startTime = (new Date()).getTime();
  while (true) {
    const selectorExists = await module.exports.exist(drone, selector);
    if (selectorExists === true) { return; }
    await sleep(intervalMS);
    const delta = ((new Date()).getTime()) - startTime;
    if (delta > timeoutMS) {
      throw new Error(`Timedout while waiting for: "${selector}"`);
    }
  }
};

exports.enterIFrame = async (drone, selector) => {
  const node = await querySelector(drone, selector);
  const {object: frameNode} = await drone.protocol.DOM.resolveNode({nodeId: node.nodeId});
  console.log(frameNode);
  const objectId = frameNode.objectId;
  const evalExpr = `() => { return (document.querySelector('#nested-heading').innerText)() }`;
  await drone.protocol.Runtime.enable();
  console.log(await drone.protocol.Runtime.callFunctionOn({ objectId: objectId, functionDeclaration: evalExpr }));
};

exports.saveScreenshot = async (drone, fileName, setSize = false, viewportHeight = 1660, viewportWidth = 1440) => {
  if (setSize) { await drone.protocol.Emulation.setVisibleSize({width: viewportWidth, height: viewportHeight}); }
  const screenshot = await drone.protocol.Page.captureScreenshot({format: 'png', fromSurface: true});
  fs.writeFileSync(`${fileName}.png`, Buffer.from(screenshot.data, 'base64'));
};