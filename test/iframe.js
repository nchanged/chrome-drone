const sut    = require('../src/index');
const expect = require('chai').expect;

describe('Testing iframe functionality:', () => {
  let drone;

  beforeEach(async () => {
    drone = await sut.createDrone({headless: false});
  });

  afterEach(async () => {
    // drone.protocol.close();
    // drone.chrome.kill();
  });

  it('WIP Can successfully navigate into iframe', async () => {
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/root-iframe.html`);
    const rootHeading = await drone.protocol.Runtime.evaluate({expression: 'document.getElementsByTagName("h1")[0].innerText'});
    expect('IFrame Below').to.equal(rootHeading.result.value);
    await sut.enterIFrame(drone, '#first-frame');
    const frame1Heading = await drone.protocol.Runtime.evaluate({expression: 'document.getElementsByTagName("h1")[0].innerText'});
    expect('I live in a iFrame. We need to go deeper').to.equal(frame1Heading.result.value);
    await sut.enterIFrame(drone, '#nested-frame');
    const frame2Heading = await drone.protocol.Runtime.evaluate({expression: 'document.getElementsByTagName("h1")[0].innerText'});
    expect('I live in a nested iFrame.').to.equal(frame2Heading.result.value);
  });
});
