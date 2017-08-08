const fs             = require('fs');
const chromeLauncher = require('chrome-launcher');
const CDP            = require('chrome-remote-interface');
const { escapeCSSSelector,
        evaluateOnNode,
        querySelector,
        sleep }      = require('./utils');

/*
 * Returns a drone onbject that is required as the first parameter to all other
 * functions. handleSIGINT must be false until the following issue is resoved
 * https://github.com/GoogleChrome/lighthouse/issues/2797
 */
exports.createDrone = async ({headless = true, disableGPU = true, port = 0, proxy = false}) => {
  const chromeOptions   = {port:         port,
                           chromeFlags:  [disableGPU ? '--disable-gpu'           : false,
                                          headless   ? '--headless'              : false,
                                          proxy      ? `--proxy-server=${proxy}` : false].filter(n => n),
                           handleSIGINT: true,
                           logLevel:     'error'};
  const chromeInstance  = await chromeLauncher.launch(chromeOptions);
  const remoteInterface = await CDP({port: chromeInstance.port});
  await Promise.all([remoteInterface.Page.enable(), remoteInterface.Runtime.enable(), remoteInterface.Network.enable()]);
  remoteInterface.Network.setExtraHTTPHeaders({headers: {"Accept-Language": "en-US"}});
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

/*
 * Returns boolean indicating if selector is present on the page
 */
exports.exist = async (drone, selector) => {
  return await module.exports.evaluate(drone, `!!document.querySelector('${escapeCSSSelector(selector)}');`);
};

/*
 * Returns nothing executed for the side effect of waiting for the provided selector
 * The page is pulled every intervalMS to check if the selector is present. If the
 * timeoutMS value is exceeded an error will be thrown.
 */
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

/*
 * Returns and array of all browser cookies for the current URL.
 */
exports.getCookies = async (drone) => {
  return drone.protocol.Network.getCookies();
};

/*
 * Returns and array of all browser cookies.
 */
exports.getAllCookies = async (drone) => {
  return drone.protocol.Network.getAllCookies();
};

/*
 * Sets a cookie with the given cookie data; may overwrite equivalent cookies if they exist.
 * cookie is an object with the following keys:
 * {url:            Optional if not provided current href is used
    name:           Required
    value:          Required
    domain:         Optional
    path:           Optional
    secure:         Optional (boolean defaults to false)
    httpOnly:       Optional (boolean defaults to false)
    sameSite:       Optional (Defaults to browser default behavior)
    expirationDate: Optional (If omitted, the cookie becomes a session cookie)}
 * https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-setCookie
 */
exports.setCookie = async (drone, cookie) => {
  if (!cookie.url) { cookie.url = await module.exports.evaluate(drone, `location.href`); }
  await drone.protocol.Network.setCookie(cookie);
};

/*
 * Returns nothing. Saves screenshot of current page as a png using the provided fileName
 */
exports.saveScreenshot = async (drone, fileName, setSize = false, height = false, width = false) => {
  if (setSize) {
    await drone.protocol.Emulation.setVisibleSize({width: width, height: height});
  } else {
    const scrollHeight = await drone.protocol.Runtime.evaluate({expression: `document.querySelector("body").scrollHeight;`});
    const scrollWidth = await drone.protocol.Runtime.evaluate({expression: `document.querySelector("body").scrollWidth;`});
    await drone.protocol.Emulation.setVisibleSize({width: scrollWidth.result.value, height: scrollHeight.result.value});
  }
  const screenshot = await drone.protocol.Page.captureScreenshot({format: 'png', fromSurface: true});
  fs.writeFileSync(fileName, Buffer.from(screenshot.data, 'base64'));
};

/*
 * Returns nothing. Saves html file of the current page using the provided fileName
 */
exports.saveHtml = async (drone, fileName) => {
  const html = await module.exports.evaluate(drone, `document.body.innerHTML`);
  fs.writeFileSync(fileName, html);
};
