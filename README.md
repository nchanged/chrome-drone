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

- createDrone({headless = true, disableGPU = true, port = 0})
- goTo(drone, url)
- setValue(drone, selector, desiredValue)
- typeValue(drone, selector, value)
- click(drone, selector)
- evaluate(drone, jsToExecute)
- waitForPageLoad(drone)
- exist(drone, selector)
- waitForSelector(drone, selector, intervalMS=250, timeoutMS=500)
- saveScreenshot(drone, fileName, setSize = false, viewportHeight = 1660, viewportWidth = 1440)
- saveHtml(drone, fileName)