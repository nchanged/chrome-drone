const sut    = require('../src/index');
const expect = require('chai').expect;

describe('Testing setting userAgent functionality:', () => {
  let drone;
  const desiredUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3';

  beforeEach(async () => {
    drone = await sut.createDrone({headless: true, overrideUserAgent: desiredUserAgent});
  });

  afterEach(async () => {
    await drone.protocol.close();
    await drone.chrome.kill();
  });

  it('Can successfully set userAgent', async () => {
    await sut.goTo(drone, `http://www.whoishostingthis.com/tools/user-agent/`);
    const actaulAgent = await sut.evaluate(drone, "document.getElementsByClassName('user-agent')[0].innerHTML");
    expect(actaulAgent).to.equal(desiredUserAgent);
  });
});
