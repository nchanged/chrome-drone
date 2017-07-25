const sut    = require('../src/index');
const expect = require('chai').expect;

describe('Testing waiting for page load functionality:', () => {
  let drone;

  beforeEach(async () => {
    drone = await sut.createDrone({headless: true});
  });

  afterEach(async () => {
    drone.protocol.close();
    drone.chrome.kill();
  });

  it('Can successfully wait for page to load', async () => {
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/delayed-pageload.html`);
    await sut.click(drone, '#redirect-button');
    await sut.waitForPageLoad(drone);
    const pageContent = await drone.protocol.Runtime.evaluate({expression: "document.querySelector('#successfully-redirected').innerHTML"});
    expect('Successfully Redirected').to.equal(pageContent.result.value);
  });
});
