const sut    = require('../src/index');
const expect = require('chai').expect;

describe('Testing iframe functionality:', () => {
  let drone;

  beforeEach(async () => {
    drone = await sut.createDrone({headless: false});
  });

  afterEach(async () => {
    await drone.protocol.close();
    await drone.chrome.kill();
  });

  it('WIP Can successfully navigate into iframe', async () => {
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/root-iframe.html`);
    const rootHeading = await drone.protocol.Runtime.evaluate({expression: 'document.getElementsByTagName("h1")[0].innerText'});
    expect('IFrame Below').to.equal(rootHeading.result.value);
    const body = await sut.enterIFrame(drone, '#first-frame');
    expect(1).to.equal(2);
  });
});
