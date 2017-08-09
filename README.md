# Chrome Drone

Autonomously control the chrome browser

## Installation

`npm install chrome-drone`

## Sample Usage

``` js
const { createDrone, goTo, setValue, click, evaluate, waitForPageLoad } = require('chrome-drone');

async function stockPrice(symbol) {
  const drone  = await createDrone({headless: true});
  try {
    await goTo(drone, 'http://www.nasdaq.com/quotes/');
    await setValue(drone, '#stock-search-text', symbol);
    await click(drone, '#stock-search-submit');
    await waitForPageLoad(drone);
    const priceLastTrade = await evaluate(drone, `document.querySelector('#qwidget_lastsale').innerText`);
    console.log(`Price of last trade: ${priceLastTrade}`);
  } finally {
    drone.protocol.close();
    drone.chrome.kill();
  }
}

stockPrice('QTWO')
```

## API

- createDrone({headless = true, disableGPU = true, port = 0, proxy = false, overrideUserAgent = false, defaultTimeoutMS = 500})
- goTo(drone, url)
- setValue(drone, selector, desiredValue)
- typeValue(drone, selector, value)
- click(drone, selector)
- evaluate(drone, jsToExecute)
- waitForPageLoad(drone)
- exist(drone, selector)
- waitForSelector(drone, selector, intervalMS=250, timeoutMS=500)
- saveScreenshot(drone, fileName, setSize = false, viewportHeight = false, viewportWidth = false)
- saveHtml(drone, fileName)
- setCookie(drone, cookie)
- getCookies(drone)
- getAllCookies(drone)
- updateSelectBoxByIndex(drone, selector, index)
- updateSelectBoxByValue(drone, selector, value)
